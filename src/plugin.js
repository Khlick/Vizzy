import VizFrame from './vizFrame.js';
import { VERSION } from 'vizzy-version';

// Create a WeakMap to store Reveal instances
const revealInstances = new WeakMap();

class Plugin {
  //  Initialization and Reveal Hooks                                       //
  
  // Constructor
  constructor(config = {}) {
    // Set default configurations and merge with user-provided config
    this.id = "Vizzy";
    this.config = {
      autoRunTransitions: config.autoRunTransitions || true,
      autoTransitionDelay: config.autoTransitionDelay || 100,
      onSlideChangedDelay: config.onSlideChangedDelay || 0,
      devMode: config.devMode || false,
      ...config
    };
    this.vizzyframes = [];
    this.showVizzyFrame = this.showVizzyFrame.bind(this);
    /** @type {WeakMap<HTMLElement, number>} last resolved Vizzy/Reveal fragment step per slide (-2 = unknown) */
    this._vizzyFragmentCursorBySlide = new WeakMap();
    /** @type {WeakMap<HTMLElement, boolean>} set when a backward step was handled in fragmenthidden so fragmentshown skips activate */
    this._vizzyPendingHiddenBackward = new WeakMap();
    // Define custom element 'vizzy' as a block-level element
    document.createElement('vizzy');
  }

  // Getter to safely access the Reveal instance using WeakMap
  get Reveal() {
    return revealInstances.get(this);
  }

  async init(Reveal) {
    // Store the Reveal instance in the WeakMap
    revealInstances.set(this, Reveal);
    this.config = {
      ...this.config,
      ...this.Reveal.getConfig().vizzy
    };
    this.log("Initializing Vizzy-Reveal Plugin", 'init');
    // inject Vizzy style class into document head
    this.injectVizzyStyles();
    // Initialize vizzy elements
    await this.preloadVizzyFrames();
    // await this.gatherFragmentsFromFrames();
    this.syncFragmentsWithSlides();
    this.setupKeydownEventListener();
    this.setupFragmentListeners();
    // Setup ready event listener
    Reveal.on('ready', () => {
      this.mountBackgroundVizzies();
    });
    // Reveal.sync() recreates all .backgrounds DOM (backgrounds.create), which drops
    // any custom nodes. Per-slide sync clears .slide-background-content innerHTML.
    // Re-mount after those operations. See reveal.js sync() and backgrounds.js.
    this.Reveal.on('sync', () => {
      queueMicrotask(() => this.mountBackgroundVizzies());
    });
    this.Reveal.on('slidesync', () => {
      queueMicrotask(() => this.mountBackgroundVizzies());
    });
    this.Reveal.on('pdf-ready', async () => {
      // When print mode is activated, let's show all vizzies
      this.log('Print PDF mode detected', 'Reveal::pdf-ready');
      await this.showVizzyFrame();
      // await this.runSlideTransitions(); // TODO, this doesn't work
    });
  }

  async runSlideTransitions() {
    const processedSlides = new WeakSet();
    // internal function for parsing slides
    const parseSlides = (slides) => {
      slides.forEach( async (slide) => {
        if (processedSlides.has(slide)) return;
        const nestedSlides = slide.querySelectorAll(':scope > section');
        if (nestedSlides.length > 0) {
          parseSlides(nestedSlides);
          return;
        }
        processedSlides.add(slide);
        if (!this.getVizzyFramesIndices(slide).length) return;
        let slideNum = this.getSlideLinearIndex(slide);
        // this.Reveal.showFragmentsIn(slide);
        let fragments = slide.querySelectorAll('.fragment');
        // Assume fragments have been synchronized and sorted?
        this.log(`Slide ${slideNum} has ${fragments.length} fragments.`, 'runSlideTransitions::parseSlides');
        
        let maxFragmentIndex = Array.from(fragments).reduce(
          (max, fragment) => {
            // Check if fragmentIndex exists, and parse it as an integer
            let index = fragment.dataset.fragmentIndex ? parseInt(fragment.dataset.fragmentIndex, 10) : NaN;
            
            // If index is a valid number, compare it with the current max
            return !isNaN(index) && index > max ? index : max;
          },
          -Infinity
        );
        if (maxFragmentIndex < 0) return;
        let prev = -1;
        for (
          let fragmentIndex = 0;
          fragmentIndex <= maxFragmentIndex;
          fragmentIndex++
        ) {
          await this.runDeactivateAllVizziesForSlideIndex(slide, prev);
          await this.handleFragmentEvent(slide, fragmentIndex, 'activate');
          await this.delay(this.config.autoTransitionDelay);
          prev = fragmentIndex;
        }
        this.setVizzyFragmentCursor(slide, maxFragmentIndex);
      });
    };
    // parse slide list
    const rootSlides = this.Reveal.getSlides();
    // Parse the slides array
    parseSlides(rootSlides);
  } 

  // IFRAME Management                                                     //

  // Locate and wrap vizzy contents:
  wrapInlineScripts(vizzyElement) {
    if (vizzyElement.querySelector('span[data-vizzy-fragments]')) {
      return;
    }
    const scriptText = vizzyElement.textContent.trim();
    if (scriptText.length > 0) {
      // Create a span element to wrap the JavaScript code
      const span = document.createElement('span');
      span.setAttribute('data-vizzy-fragments', '');
      span.style.display = 'none'; // Hide the span

      // Set the script text inside the span
      span.textContent = scriptText;

      // Clear the vizzy element's content and append the span
      vizzyElement.textContent = '';
      vizzyElement.appendChild(span);

      this.log(`Wrapped inline script in vizzy element with data-vizzy-fragments span`, 'wrapInlineScripts');
    }
  }
  
  // Parse Vizzy Frames and Backgrounds
  async preloadVizzyFrames() {
    // const rootSlides = document.querySelectorAll('.slides > section');
    const rootSlides = this.Reveal.getSlides();

    this.log(`Preloading Vizzy elements for ${rootSlides.length} slide groups.`, 'preloadVizzyFrames');
    const vizFrameInitPromises = []; // Array to store promises of init calls
    let slideCount = 0;
    let vizzyCount = 0;
    // Reveal.getSlides() returns every section (stack + vertical children). We also
    // recurse into :scope > section, so each leaf would be processed twice without this.
    const processedSlides = new WeakSet();

    const parseSlides = (slides) => {
      slides.forEach((slide) => {
        if (processedSlides.has(slide)) return;

        const nestedSlides = slide.querySelectorAll(':scope > section');
        if (nestedSlides.length > 0) {
          parseSlides(nestedSlides);
          return;
        }
        processedSlides.add(slide);
        slideCount += 1;

        const slideIndex = this.getSlideIndex(slide);
        this.log(`Parsing slide ${slideIndex.linear}`);

        // Check if the slide has a Vizzy background
        const isBackground = slide.hasAttribute('data-background-vizzy');
        if (isBackground) {
          const src = slide.getAttribute('data-background-vizzy');
          const vizzyContainer = this.createVizzyElementForBackground(slide);
          const vizFrame = new VizFrame(
            src,
            true,
            vizzyContainer,
            slideIndex,
            0,
            this.config.devMode,
            this.config.onSlideChangedDelay
          );
          // Add timeout to each init call
          vizFrameInitPromises.push(
            this.withTimeout(vizFrame.init(), 10000, `Timeout initializing VizFrame for slide ${slideIndex.linear}`)
          );
          this.vizzyframes.push(vizFrame);
          vizzyCount += 1;
        }

        // Check for and initialize foreground Vizzy elements
        const vizzyElements = slide.querySelectorAll('vizzy[data-src]');
        vizzyElements.forEach((vizzyElement, id) => {
          const src = vizzyElement.getAttribute('data-src');
          this.wrapInlineScripts(vizzyElement);
          if (src) {
            const vizFrame = new VizFrame(
              src,
              false,
              vizzyElement,
              slideIndex,
              id,
              this.config.devMode,
              this.config.onSlideChangedDelay
            );
            vizFrameInitPromises.push(
              this.withTimeout(vizFrame.init(), 10000, `Timeout initializing VizFrame for slide ${slideIndex.linear}`)
            );
            this.vizzyframes.push(vizFrame);
            vizzyCount += 1;
          } else {
            this.log('Skipping vizzy element without data-src attribute', 'preloadVizzyFrames');
          }
        });
      });
    };
  
    // Parse the slides array
    parseSlides(rootSlides);
    
    try {
      // Wait for all vizFrame init calls to complete
      await Promise.all(vizFrameInitPromises);
      this.log(`${vizzyCount} VizFrames initialized for ${slideCount} slides.`);
    } catch (error) {
      this.log(`Error initializing VizFrames: ${error.message}`, 'preloadVizzyFrames');
    }
  }
  
  // Utility function to add a timeout to a promise
  withTimeout(promise, ms, timeoutMessage) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, ms);
  
      promise
        .then(value => {
          clearTimeout(timer);
          resolve(value);
        })
        .catch(reason => {
          clearTimeout(timer);
          reject(reason);
        });
    });
  }
  
  /**
   * Move each background vizzy into Reveal's slide background layer.
   * Must run after backgrounds exist and again after Reveal.sync() / slidesync,
   * because those paths recreate or clear background DOM.
   *
   * Why we do not call Reveal.sync() after mounting: historically that may have
   * been used to refresh layout or fragment ordering after DOM changes, but
   * Reveal.sync() runs backgrounds.create() and wipes the entire .backgrounds
   * tree (see reveal.js and backgrounds.js in hakimel/reveal.js). Use
   * Reveal.syncSlide(slide) if you need a targeted refresh without destroying
   * all backgrounds.
   */
  mountBackgroundVizzies() {
    this.vizzyframes.forEach(vizFrame => {
      if (!vizFrame.isBackground) return;
      const slide = this.Reveal.getSlide(vizFrame.index.h, vizFrame.index.v);
      const backgroundContent = this.getSlideBackgroundContent(slide, vizFrame.index);
      if (!backgroundContent) {
        this.log(`Unable to resolve background container for slide: ${vizFrame.getIndex('linear')}`, 'mountBackgroundVizzies');
        return;
      }
      if (!backgroundContent.contains(vizFrame.vizzyContainer)) {
        backgroundContent.appendChild(vizFrame.vizzyContainer);
        this.log(`Appended vizzy background to slide: ${vizFrame.getIndex('linear')}`, 'mountBackgroundVizzies');
      }
    });
  }

  //  Fragment Management                                                   //

  // Synchronize fragments with slides
  syncFragmentsWithSlides() {
    this.log('Synchronizing fragments with slides', 'syncFragmentsWithSlides');
    const processedSlides = new WeakSet();

    const traverseSlides = (slides) => {
      slides.forEach(slide => {
        if (processedSlides.has(slide)) return;

        const nestedSlides = slide.querySelectorAll(':scope > section');
        if (nestedSlides.length > 0) {
          traverseSlides(nestedSlides);
          return;
        }
        processedSlides.add(slide);
        const indices = this.getVizzyFramesIndices(slide);
        const slideNum = this.getSlideLinearIndex(slide);

        if (indices.length > 0) {
          const fragmentIndices = [];
          const fragmentIndicesMinusOne = [];

          indices.forEach(index => {
            const vizFrame = this.vizzyframes[index];
            if (vizFrame.fragmentList) {
              vizFrame.fragmentList.forEach(fragment => {
                if (fragment.index == -1) {
                  fragmentIndicesMinusOne.push(fragment);
                } else {
                  fragmentIndices.push({ index: fragment.index, id: vizFrame.id });
                }
              });
            }
          });

          fragmentIndices.forEach(obj => {
            // Create span element for vizzies
            const span = document.createElement('span');
            span.classList.add('fragment');
            span.classList.add('vizzy-fragment');
            span.setAttribute('data-vizzy-id', obj.id);
            span.setAttribute('data-fragment-index', obj.index);
            span.setAttribute('data-vizzy-index', obj.index);
            slide.appendChild(span);
            this.log(`Appended fragment span with index ${obj.index} for vizzy id ${obj.id} to slide ${slideNum}`, 'syncFragmentsWithSlides');
          });

          // Store fragments with index -1 to run immediately after slide transition
          if (fragmentIndicesMinusOne.length > 0) {
            slide.dataset.vizzyImmediateFragments = JSON.stringify(fragmentIndicesMinusOne.map(f => ({
              index: f.index,
              methods: f.methods
            })));
          }
        }
      });
    };

    // const rootSlides = document.querySelectorAll('.slides > section');
    const rootSlides = this.Reveal.getSlides(); // Gets all slides linearly
    traverseSlides(rootSlides);
  }

  // Set up fragment listeners
  setupFragmentListeners() {
    this.Reveal.on('fragmentshown', async event => {
      this.log("Fragment Shown", 'onFragmentShown');
      const fragmentEl = event.fragment || event.detail?.fragment;
      if (!fragmentEl) return;
      const slide = fragmentEl.closest('section');
      if (!slide) return;

      if (this._vizzyPendingHiddenBackward.get(slide)) {
        this._vizzyPendingHiddenBackward.delete(slide);
        const shownIdx = this.getFragmentIndexFromFragment(fragmentEl, slide);
        if (!Number.isNaN(shownIdx)) {
          this.setVizzyFragmentCursor(slide, shownIdx);
        }
        this.log("Skipped activate after backward (handled in fragmenthidden).", "onFragmentShown");
        return;
      }

      const arrivingIdx = this.getFragmentIndexFromFragment(fragmentEl, slide);
      if (Number.isNaN(arrivingIdx)) return;

      const stored = this.getVizzyFragmentCursor(slide);
      const oldIdx = stored === -2 ? -1 : stored;
      const forward = arrivingIdx > oldIdx || (oldIdx === -1 && arrivingIdx >= 0);

      if (forward) {
        await this.runDeactivateAllVizziesForSlideIndex(slide, oldIdx);
        await this.handleFragmentEvent(slide, arrivingIdx, 'activate');
        this.setVizzyFragmentCursor(slide, arrivingIdx);
        this.log(`Forward fragment step to ${arrivingIdx} (from ${oldIdx}).`, "onFragmentShown");
      } else if (arrivingIdx === oldIdx) {
        this.log(`No Vizzy forward step (arriving ${arrivingIdx} equals cursor).`, "onFragmentShown");
      } else {
        this.setVizzyFragmentCursor(slide, arrivingIdx);
        this.log(`Backward fragmentshown to ${arrivingIdx}; activate skipped.`, "onFragmentShown");
      }
    });

    this.Reveal.on('fragmenthidden', async event => {
      this.log("Fragment Hidden", 'onFragmentHidden');
      const fragmentEl = event.fragment || event.detail?.fragment;
      if (!fragmentEl) return;
      const slide = fragmentEl.closest('section');
      if (!slide) return;

      const leavingIdx = this.getFragmentIndexFromFragment(fragmentEl, slide);
      if (Number.isNaN(leavingIdx)) return;

      const newIdxRaw = parseInt(slide.dataset.fragment, 10);
      const newIdx = Number.isNaN(newIdxRaw) ? -1 : newIdxRaw;

      if (leavingIdx > newIdx) {
        this._vizzyPendingHiddenBackward.set(slide, true);
        await this.runDeactivateAllVizziesForSlideIndex(slide, leavingIdx);
        await this.handleFragmentEvent(slide, leavingIdx, 'reverse');
        this.setVizzyFragmentCursor(slide, newIdx);
        this.log(`Backward fragment step from ${leavingIdx} to ${newIdx}.`, "onFragmentHidden");
      }
    });

    this.Reveal.on('slidechanged', async event => {
      const slide = event.currentSlide;

      this.log("Checking if slide is still in future.", "onSlideChanged");
      
      await this.waitForClass(slide, 'present', this.config.autoTransitionDelay);

      const ds = slide.dataset.fragment;
      const parsed = ds === undefined || ds === '' ? -1 : parseInt(ds, 10);
      this.setVizzyFragmentCursor(slide, Number.isNaN(parsed) ? -1 : parsed);

      this.log("Checking autorun fragments", "onSlideChanged");
      
      // Run any vizzy _fragments with index -1
      if (slide.dataset.vizzyImmediateFragments) {
        const immediateFragments = JSON.parse(slide.dataset.vizzyImmediateFragments);
        for (const fragment of immediateFragments) {
          await this.delay(this.config.autoTransitionDelay);
          await this.handleFragmentEvent(slide, fragment.index, 'activate');
        }
        this.setVizzyFragmentCursor(slide, -1);
      }
      this.log("Checking to run up to last fragment.", "onSlideChanged");
      if (this.config.autoRunTransitions && slide.hasAttribute('data-fragment')) {
        // check if no vizzies on slide
        if (!this.getVizzyFramesIndices(slide).length) return
        const slideFragmentState = parseInt(slide.dataset.fragment);
        this.log(`Slide Fragment State: ${slideFragmentState}`, "onSlideChanged");
        if (slideFragmentState < 0) {
          // moving forward, don't run any loops
          return
        }
        let prev = -1;
        for (
          let fragmentIndex = 0;
          fragmentIndex <= slideFragmentState;
          fragmentIndex++
        ) {
          await this.runDeactivateAllVizziesForSlideIndex(slide, prev);
          await this.handleFragmentEvent(slide, fragmentIndex, 'activate');
          await this.delay(this.config.autoTransitionDelay);
          prev = fragmentIndex;
        }
        this.setVizzyFragmentCursor(slide, slideFragmentState);
      }
    });
  }

  getVizzyFragmentCursor(slide) {
    if (!this._vizzyFragmentCursorBySlide.has(slide)) {
      return -2;
    }
    return this._vizzyFragmentCursorBySlide.get(slide);
  }

  setVizzyFragmentCursor(slide, index) {
    this._vizzyFragmentCursorBySlide.set(slide, index);
  }

  getFragmentIndexFromFragment(fragmentEl, slide) {
    const eventIndex = parseInt(
      fragmentEl?.dataset?.fragmentIndex || fragmentEl?.getAttribute('data-fragment-index'),
      10
    );
    if (!Number.isNaN(eventIndex)) {
      return eventIndex;
    }
    const slideIndex = parseInt(slide?.dataset?.fragment, 10);
    if (!Number.isNaN(slideIndex)) {
      return slideIndex;
    }
    return NaN;
  }

  async runDeactivateAllVizziesForSlideIndex(slide, index) {
    const vizzyFrames = this.getVizzyFramesIndices(slide)
      .map(i => this.vizzyframes[i]);
    for (const vizzyFrame of vizzyFrames) {
      await this.executeVizzyMethod(index, vizzyFrame, 'deactivate');
    }
  }

  waitForClass(element, className, timeout) {
    return new Promise((resolve, reject) => {
      const interval = 10;
      let elapsedTime = 0;

      const checkClass = () => {
        this.log(`Classes: [${element.classList}].`, "waitForClass");
        if (element.classList.contains(className)) {
          resolve();
        } else if (elapsedTime >= timeout) {
          resolve();  // Timeout reached, resolve anyway
        } else {
          elapsedTime += interval;
          setTimeout(checkClass, interval);
        }
      };
      checkClass();
    });
  }

  waitForVizzyLoadStatus(vizzy, loadStatus, timeout) {
    return new Promise((resolve, reject) => {
      const interval = 10;
      let elapsedTime = 0;

      const checkStatus = () => {
        if (vizzy.loaded === loadStatus) {
          resolve();
        } else if (elapsedTime >= timeout) {
          resolve();  // Timeout reached, resolve anyway
        } else {
          elapsedTime += interval;
          setTimeout(checkStatus, interval);
        }
      };
      checkStatus();
    });
  }

  getSlideBackgroundContent(slide, slideIndex) {
    if (slide && slide.slideBackgroundContentElement) {
      return slide.slideBackgroundContentElement;
    }

    if (this.Reveal && typeof this.Reveal.getSlideBackground === 'function') {
      const background = this.Reveal.getSlideBackground(slideIndex.h, slideIndex.v);
      if (background) {
        return background.querySelector('.slide-background-content') || background;
      }
    }

    return null;
  }

  getFragmentIndexFromEvent(event, slide) {
    const fragmentEl = event.fragment || event.detail?.fragment;
    if (fragmentEl) {
      return this.getFragmentIndexFromFragment(fragmentEl, slide);
    }
    const slideIndex = parseInt(slide?.dataset?.fragment, 10);
    if (!Number.isNaN(slideIndex)) {
      return slideIndex;
    }
    return -1;
  }

  // Handle fragment events
  async handleFragmentEvent(slide, fragmentIndex, method) {
    // subset vizzyframes to current slide only
    const vizzyFrames = this.getVizzyFramesIndices(slide)
      .map(i => this.vizzyframes[i]);
    // Exit early if no vizzy frames for this slide.
    if (!vizzyFrames.length) return;
    if (fragmentIndex < 0) {
      // Handle auto run by running all -1 index fragments on vizzyframes for this slide
      for (let vizzyFrame of vizzyFrames) {
        await this.executeVizzyMethod(fragmentIndex, vizzyFrame, method);
      }
      return
    }
    // parse slide fragments for data-vizzy-fragments.
    const vizzyFragments = slide.querySelectorAll(`.vizzy-fragment[data-fragment-index="${fragmentIndex}"]`);
    if (!vizzyFragments.length) {
      this.log(`No vizzy fragments for fragment index ${fragmentIndex}.`, 'handleFragmentEvent');
      return
    }
    this.log(`Handling fragment ${fragmentIndex} for slide ${vizzyFrames[0].getIndex('linear')} (${method})`, 'handleFragmentEvent')
    // Loop through fragments, get vizzy id and index, call corresponding fragment method on iframe window
    for (let fragment of vizzyFragments) {
      let id = parseInt(fragment.getAttribute('data-vizzy-id'));
      let index = parseInt(fragment.getAttribute('data-vizzy-index'));
      // Get vizzy frame from id
      let vizzyFrame = vizzyFrames.filter(frame => frame.id == id)[0];
      await this.executeVizzyMethod(index, vizzyFrame, method);
    }
  }

  async executeVizzyMethod(index, vizzyFrame, method) {
    try {
      if (method === 'reverse' && index < 0) {
        return;
      }
      await vizzyFrame.ensureIframeLoadedForInteraction();
      let fragmentObj = vizzyFrame.fragmentsObject;
      let fragmentObjIndex = fragmentObj.findIndex(f => f.index === index);
      if (fragmentObjIndex < 0) {
        this.log(`No entry found for index ${index}.`,'executeVizzyMethod');
        return
      }
      const fn = fragmentObj[fragmentObjIndex][method];
      if (typeof fn === 'function') {
        await Promise.resolve(fn());
        this.log(`Executed ${method} for vizzy index ${index} in position ${fragmentObjIndex}.`, 'executeVizzyMethod');
      } else {
        this.log(`Method "${method}" does not exist for fragment ${index}.`);
      }
    } catch (e) {
      this.log(`Error executing ${method} for vizzy index ${index}: ${e}`, 'executeVizzyMethod');
    }
  }
  
  //  UTILITIES                                                             //
  

  // Logging method
  log(message, id = null) {
    if (this.config.devMode) {
      if (id === null) {
        const error = new Error();
        const stack = error.stack.split('\n');
        // Assuming the parent function is at the third position in the stack trace
        id = stack[2] ? stack[2].trim().split(' ')[1] : null;
      }
      console.log(`[Vizzy v${VERSION}${id ? ":" + id : ""}] ${message}`);
    }
  }

  // Helper function to delay execution
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check for print mode
  async checkPrintMode() {
    // if (document.documentElement.classList.contains('reveal-print') ||
    //   document.documentElement.classList.contains('print-pdf')) {
    if (this.Reveal.isPrintView()) {
      while (!this.Reveal.isReady()) {
        this.delay(10);
      }
      this.log('Print PDF mode detected', 'checkPrintMode');
      await this.showVizzyFrame(); // no input shows all frames
      if (this.config.autoRunTransitions) {
        // TODO
        // this.log("Running transitions...", 'checkPrintMode');
        // await this.runTransitions();
      }
    }
  }

  // show/hide vizzy frames by index into vizzyframes
  // Show vizzy frame(s)
  async showVizzyFrame(indices = null) {
    if (indices === null) {
      this.vizzyframes.forEach(vizFrame => {
        const dataSrc = vizFrame.iframe.getAttribute('data-src');
        if (dataSrc) {
          vizFrame.iframe.setAttribute('src', dataSrc);
        }
      });
    } else if (Array.isArray(indices)) {
      indices.forEach(index => {
        if (index >= 0 && index < this.vizzyframes.length) {
          const vizFrame = this.vizzyframes[index];
          const dataSrc = vizFrame.iframe.getAttribute('data-src');
          if (dataSrc) {
            vizFrame.iframe.setAttribute('src', dataSrc);
          }
        } else {
          this.log(`Invalid vizzy frame index: ${index}`, 'showVizzyFrame');
        }
      });
    } else if (typeof indices === 'number' && indices >= 0 && indices < this.vizzyframes.length) {
      const vizFrame = this.vizzyframes[indices];
      const dataSrc = vizFrame.iframe.getAttribute('data-src');
      if (dataSrc) {
        vizFrame.iframe.setAttribute('src', dataSrc);
      }
    } else {
      this.log(`Invalid input for showVizzyFrame: ${indices}`, 'showVizzyFrame');
    }
  }

  // Hide vizzy frame(s)
  async hideVizzyFrame(indices = null) {
    if (indices === null) {
      this.vizzyframes.forEach(vizFrame => {
        vizFrame.iframe.removeAttribute('src');
      });
    } else if (Array.isArray(indices)) {
      indices.forEach(index => {
        if (index >= 0 && index < this.vizzyframes.length) {
          this.vizzyframes[index].iframe.removeAttribute('src');
        } else {
          this.log(`Invalid vizzy frame index: ${index}`, 'hideVizzyFrame');
        }
      });
    } else if (typeof indices === 'number' && indices >= 0 && indices < this.vizzyframes.length) {
      this.vizzyframes[indices].iframe.removeAttribute('src');
    } else {
      this.log(`Invalid input for hideVizzyFrame: ${indices}`, 'hideVizzyFrame');
    }
  }

  // Run transitions on iframes
  async runTransitions() {
    for (let vizzy of this.vizzyframes) {
      let slide = this.getSlideFromVizzy(vizzy);
      let fragments = Array
        .from(slide.querySelectorAll(".vizzy-fragment"))
        .sort((a, b) => parseInt(a.dataset.vizzyIndex, 10) - parseInt(b.dataset.vizzyIndex, 10));
      let nFragments = fragments.length;
      if (!nFragments) {
        continue
      }
      let prev = -1;
      for (let fragment of fragments) {
        let index = parseInt(fragment.getAttribute('data-vizzy-index'), 10);
        await this.executeVizzyMethod(prev, vizzy, 'deactivate');
        await this.executeVizzyMethod(index, vizzy, 'activate');
        await this.delay(this.config.autoTransitionDelay);
        prev = index;
      }
    }
  }

  // Setup keydown event listener on iframes. When constructing iframes, we need to propagate a keydown on the iframe.
  setupKeydownEventListener() {
    this.log('Setting up keydown propagation from iframe to parent', 'setupKeydownPropagation');
    window.document.addEventListener('iframe-keydown', (event) => {
      this.Reveal.triggerKey(event.detail.keyCode);
      this.log(`Propagated keydown event: keyCode ${event.detail.keyCode}`, 'setupKeydownPropagation');
    }, false);
  }

  // Get slide index including linear index
  getSlideIndex(slide) {
    const indices = this.Reveal.getIndices(slide);
    const linearIndex = this.calculateLinearIndex(indices);
    return {
      h: indices.h,
      v: indices.v || 0,
      linear: linearIndex
    };
  }
  // Get linear index from slide
  getSlideLinearIndex(slide) {
    return this.calculateLinearIndex(this.Reveal.getIndices(slide));
  }
  // Calculate linear index of a slide
  calculateLinearIndex(indices) {
    const horizontalSlides = Array.from(document.querySelectorAll('.reveal .slides>section'));
    let linearIndex = 0;

    for (let i = 0; i < indices.h; i++) {
      const verticalSlides = horizontalSlides[i].querySelectorAll('section').length;
      linearIndex += (verticalSlides > 0 ? verticalSlides : 1);
    }

    // if no length, then 0, otherwise current v-index down the stack
    linearIndex += (indices.v || 0);
    return linearIndex;
  }

  // Setup vizzy tag css in head.
  injectVizzyStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      vizzy {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        margin: 0 auto;
        overflow: hidden;
      }
      .reveal vizzy iframe {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height:100%;
        z-index: 1;
        border: 0;
        overflow: hidden;
      }
      .reveal .slide-background-content > vizzy {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
      }
    `;
    document.head.appendChild(style);
    this.log('Injected default CSS styles for vizzy elements', 'injectVizzyStyles');
  }

  // Create vizzy element from background section
  createVizzyElementForBackground(bgParent) {
    const vizzyElement = document.createElement('vizzy');
    vizzyElement.setAttribute('data-src', bgParent.dataset.backgroundVizzy);
    Array.from(bgParent.attributes).forEach(attr => {
      if (attr.name.startsWith('data-vizzy-')) {
        vizzyElement.setAttribute(attr.name.replace('data-vizzy-', ''), attr.value);
      }
    });
    if (bgParent.hasAttribute('data-preload')) {
      bgParent.removeAttribute('data-preload');
      vizzyElement.setAttribute('data-preload', '');
    }
    return vizzyElement;
  }

  // Get vizzyframes indices for a given slide
  getVizzyFramesIndices(slide) {
    const slideIndex = this.getSlideIndex(slide);
    const indices = this.vizzyframes
      .map((frame, index) => (frame.index.h === slideIndex.h && frame.index.v === slideIndex.v) ? index : -2)
      .filter(index => index !== -2);
    return indices;
  }

  getSlideFromVizzy(vizzy) {
    return this.Reveal.getSlide(vizzy.index.h, vizzy.index.v);
  }
} // PLUGIN END

const Vizzy = new Plugin();
Vizzy.version = VERSION;
export default Vizzy;