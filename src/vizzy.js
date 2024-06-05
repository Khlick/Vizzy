class Vizzy {
  constructor(config = {}) {
    this.config = config;
    this.iframes = [];
    this.defaultTransitionDuration = config.transitionDuration || 300;
    this.autoRunTransitions = config.autoRunTransitions || false;
  }

  init(deck) {
    this.deck = deck;
    this.config = this.deck.getConfig().vizzy || {};
    this.loadIframes();
    this.handleFragments();
    this.checkPrintMode();
    this.deck.on('slidechanged', event => this.onSlideChanged(event));
    this.deck.on('overviewshown', event => this.onOverviewShown(event));
    this.deck.on('overviewhidden', event => this.onOverviewHidden(event));
  }

  loadIframes() {
    const iframes = document.querySelectorAll('iframe[data-src]');
    iframes.forEach(iframe => {
      iframe.src = iframe.dataset.src;
      this.iframes.push(iframe);
    });
  }

  handleFragments() {
    this.deck.on('fragmentshown', event => {
      const fragment = event.fragment;
      this.transitionIframe(fragment, 'forward');
    });

    this.deck.on('fragmenthidden', event => {
      const fragment = event.fragment;
      this.transitionIframe(fragment, 'backward');
    });
  }

  transitionIframe(fragment, direction) {
    const iframe = fragment.closest('section').querySelector('iframe');
    if (iframe) {
      iframe.contentWindow.postMessage({ type: 'fragment', direction }, '*');
    }
  }

  checkPrintMode() {
    if (window.location.search.match(/print-pdf/gi)) {
      this.preloadIframes();
      if (this.autoRunTransitions) {
        this.runTransitions();
      }
    }
  }

  preloadIframes() {
    this.iframes.forEach(iframe => {
      iframe.src = iframe.dataset.src;
    });
  }

  runTransitions() {
    this.iframes.forEach(iframe => {
      const transitions = iframe.contentWindow._transitions || [];
      transitions.forEach((transition, index) => {
        setTimeout(() => {
          iframe.contentWindow.postMessage({ type: 'fragment', direction: 'forward', index }, '*');
        }, this.defaultTransitionDuration * index);
      });
    });
  }

  onSlideChanged(event) {
    const currentSlide = event.currentSlide;
    const previousSlide = event.previousSlide;
    const directionBack = this.isNavigationBack(currentSlide, previousSlide);
    this.updateBackgroundSlides(event);
    if (this.config.runLastState && directionBack) {
      const allIframes = this.getAllIframes(currentSlide);
      allIframes.forEach(iframe => this.triggerLastState(iframe));
    }

    if (!directionBack) {
      const allIframes = this.getAllIframes(currentSlide);
      setTimeout(() => {
        this.triggerOnSlideChangeTransition(allIframes);
      }, this.config.onSlideChangedDelay || 0);
    }
  }

  onOverviewShown(event) {
    this.updateBackgroundSlides(event, true);
  }

  onOverviewHidden(event) {
    this.clearBackgrounds();
    this.updateBackgroundSlides(event, false);
  }

  clearBackgrounds() {
    if (!this.backgroundSlides) return;
    this.backgroundSlides.forEach(backgroundSlide => {
      const backgroundContent = this.deck.getSlideBackground(backgroundSlide.slide).querySelector('.slide-background-content');
      backgroundContent.innerHTML = '';
    });
  }

  updateBackgroundSlides(event, isOverview = false) {
    if (!this.backgroundSlides) return;
    const viewDistance = isOverview ? 10 : this.deck.getConfig().viewDistance;
    this.backgroundSlides.forEach(backgroundSlide => {
      const distanceX = Math.abs((event.indexh || 0) - backgroundSlide.index.h) || 0;
      const withinView = (distanceX < viewDistance) && backgroundSlide.preload;
      if (withinView) {
        const styles = this.getIframeStyle(backgroundSlide);
        this.initializeIframe(backgroundSlide, styles);
      } else {
        const slideBackground = backgroundSlide.slide.slideBackgroundContentElement;
        const toRemove = slideBackground.querySelector(".iframe-visualization");
        if (toRemove) toRemove.parentNode.removeChild(toRemove);
      }
    });
  }

  getIframeStyle(viz) {
    const defaultStyle = {
      'margin': '0px',
      'width': '100%',
      'height': '100%',
      'max-width': '100%',
      'max-height': '100%',
      'z-index': 1,
      'border': 0
    };

    const dataStyleString = viz.container.getAttribute('data-style') || "";
    const regexStyle = /\s*([^;^\s]*)\s*:\s*([^;^\s]*(\s*)?(!important)?)/g;

    let inputtedStyle = {}, matchStyleArray;
    while (matchStyleArray = regexStyle.exec(dataStyleString)) {
      inputtedStyle[matchStyleArray[1]] = matchStyleArray[2];
    }
    const iframeStyle = { ...defaultStyle, ...inputtedStyle };

    const iframeExtra = {
      scrolling: viz.container.getAttribute('data-scroll') || "yes"
    };
    return { iframeStyle, iframeExtra };
  }

  async initializeIframe(vizObject, styles) {
    const { isBackground, onCurrentSlide, index, slide, container, file, fragmentsInSlide, preload, iframeStyle, iframeExtra } = vizObject;

    container.style.overflow = (container.style.overflow === "" && !JSON.parse(container.getAttribute('data-overflow-shown'))) ? 'hidden' : container.style.overflow;

    const fileExists = !this.config.disableCheckFile ? await this.doesFileExist(this.config.mapPath + file) : true;
    const filePath = (this.config.tryFallbackURL && fileExists) ? this.config.mapPath + file : file;

    const iframeList = container.querySelectorAll('iframe');
    if (iframeList.length > 0) return;

    const stylesString = Object.entries(iframeStyle).reduce((res, [key, value]) => `${res}${key}:${String(value).replace(/\s+/, " ")};`, "");
    let iframeConfig = {
      'class': 'iframe-visualization',
      'sandbox': 'allow-popups allow-scripts allow-forms allow-same-origin',
      'style': stylesString,
      ...iframeExtra
    };

    const src = onCurrentSlide ? { 'src': filePath, 'data-lazy-loaded': '' } : { 'data-src': filePath };
    const preloading = preload ? { 'data-preload': true } : {};
    const backgroundIframe = isBackground ? { 'allowfullscreen': '', 'mozallowfullscreen': '', 'webkitallowfullscreen': '', 'width': '100%', 'height': '100%' } : {};

    iframeConfig = { ...iframeConfig, ...src, ...preloading, ...backgroundIframe };

    const iframe = document.createElement('iframe');
    Object.entries(iframeConfig).forEach(([key, value]) => iframe.setAttribute(key, value));

    if (isBackground) {
      const backgroundSlide = this.deck.getSlideBackground(slide);
      if (backgroundSlide.querySelector("iframe")) return;

      const slideBackgroundContent = backgroundSlide.querySelector(".slide-background-content");
      slideBackgroundContent.appendChild(iframe);
    } else {
      container.appendChild(iframe);
    }

    iframe.addEventListener("load", () => {
      const fig = (iframe.contentWindow || iframe.contentDocument);

      fig.addEventListener('keydown', (e) => {
        const customEvent = new CustomEvent('iframe-keydown', { detail: e });
        window.parent.document.dispatchEvent(customEvent);
      });

      const nodeList = this.getAllIframes(slide);
      let allVisualizationSteps = [];
      let onSlideChangeTransition = null;
      nodeList.forEach(node => {
        const fig = (node.contentWindow || node.contentDocument);
        const transitionSteps = fig._transitions && fig._transitions.reduce((acc, curr) => {
          if (typeof(curr.index) === 'number' || curr.index === undefined) {
            acc['inSlide'].push(curr);
          } else {
            acc['onSlideChange'].push(curr);
          }
          return acc;
        }, { 'onSlideChange': [], 'inSlide': [] });
        if (transitionSteps && transitionSteps.inSlide.length) {
          allVisualizationSteps.push(transitionSteps.inSlide);
        }
        if (transitionSteps && transitionSteps.onSlideChange.length && node === iframe) {
          onSlideChangeTransition = transitionSteps.onSlideChange[0];
        }
      });

      const [allVizStepsDict, spansToCreate] = this.generateVisualizationStepsIndices(allVisualizationSteps, fragmentsInSlide);

      nodeList.forEach((node, i) => node.transitionSteps = allVizStepsDict[i]);
      iframe.transitionOnSlideChange = onSlideChangeTransition;

      const currentSlide = this.deck.getCurrentSlide();
      const previousSlide = this.deck.getPreviousSlide();
      const isNavBack = this.isNavigationBack(currentSlide, previousSlide);
      let fragmentSpans = slide.querySelectorAll('.fragment.visualizationStep');
      if (fragmentSpans.length < spansToCreate.length) {
        const nSpansToCreate = spansToCreate.length - fragmentSpans.length;
        for (let i = 0; i < nSpansToCreate; i++) {
          const spanFragment = document.createElement('span');
          spanFragment.setAttribute('class', isNavBack ? 'fragment visualizationStep visible' : 'fragment visualizationStep');
          slide.appendChild(spanFragment);
        }
      }
      fragmentSpans = slide.querySelectorAll('.fragment.visualizationStep');
      spansToCreate.forEach((span, i) => fragmentSpans[i].setAttribute('data-fragment-index', span));

      if (this.config.runLastState && slide === currentSlide) {
        if (iframe === nodeList[nodeList.length - 1]) {
          nodeList.forEach(node => this.triggerLastState(node));
        }
      }
      this.deck.layout();
    });
  }

  getAllIframes(slide) {
    const backgroundSlide = this.deck.getSlideBackground(slide);
    const iframeSlide = Array.from(slide.querySelectorAll('iframe'));
    const iframeBackground = Array.from(backgroundSlide.querySelectorAll('iframe'));
    let allIframes = [...iframeSlide, ...iframeBackground];
    allIframes = allIframes.filter(d => d.className.includes("iframe-visualization"));
    return allIframes;
  }

  async doesFileExist(fileUrl) {
    try {
      const response = await fetch(fileUrl, { method: "head", mode: "no-cors" });
      return response.ok && response.status == 200;
    } catch (error) {
      console.log("Error ", error);
      return false;
    }
  }

  generateVisualizationStepsIndices(allVisualizationSteps, slideFragmentSteps) {
    let allVisualizationIndices = [];
    allVisualizationSteps.forEach(visualizationSteps => {
      const nVisualizationSteps = visualizationSteps.length;
      const visualizationIndices = visualizationSteps.filter(d => d.index >= 0).map(d => d.index);
      if (visualizationIndices.length < nVisualizationSteps) {
        const nIndicesToAdd = nVisualizationSteps - visualizationIndices.length;
        const startIndex = visualizationIndices.length === 0 ? 0 : Math.max(...visualizationIndices) + 1;
        for (let i = 0; i < nIndicesToAdd; i++) {
          visualizationIndices.push(i + startIndex);
        }
      }
      allVisualizationIndices.push(visualizationIndices);
    });

    let uniqueAllVisualizationIndices = [...new Set([].concat(...allVisualizationIndices))];
    uniqueAllVisualizationIndices.sort((a, b) => a - b);

    const nSlideFragmentSteps = slideFragmentSteps.length;
    const extraIndex = uniqueAllVisualizationIndices.map(d => d > nSlideFragmentSteps - 1);
    const extraSteps = extraIndex.reduce((a, b) => a + b, 0);

    let fragmentIndexToCreate = extraSteps === 0 ? [] : [...Array(extraSteps).keys()].map(d => d + nSlideFragmentSteps);

    let hashTable = {};
    let count = 0;
    uniqueAllVisualizationIndices.forEach(d => {
      if (d > nSlideFragmentSteps - 1) {
        hashTable[d] = fragmentIndexToCreate[count];
        count += 1;
      } else {
        hashTable[d] = d;
      }
    });

    let allVisualizationStepsIndices = [];
    allVisualizationSteps.forEach((visualizationSteps, i) => {
      const visualizationIndices = allVisualizationIndices[i];
      if (visualizationSteps && visualizationIndices) {
        const nVisualizationSteps = visualizationSteps.length;
        let visualizationStepsIndices = {};
        for (let j = 0; j < nVisualizationSteps; j++) {
          visualizationStepsIndices[hashTable[visualizationIndices[j]]] = {
            transitionForward: visualizationSteps[j].transitionForward,
            transitionBackward: visualizationSteps[j].transitionBackward === "none" ? () => {} : visualizationSteps[j].transitionBackward || visualizationSteps[Math.max(j - 1, 0)].transitionForward
          };
        }
        allVisualizationStepsIndices.push(visualizationStepsIndices);
      }
    });
    return [allVisualizationStepsIndices, uniqueAllVisualizationIndices.map(d => hashTable[d])];
  }

  triggerLastState(iframe) {
    const currentSlide = this.deck.getCurrentSlide();
    const previousSlide = this.deck.getPreviousSlide();
    if (this.isNavigationBack(currentSlide, previousSlide)) {
      const allFragments = currentSlide.querySelectorAll('.fragment.visualizationStep');
      if (allFragments.length === 0) return;
      let allFragmentsIndices = [];
      allFragments.forEach(fragment => allFragmentsIndices.push(parseInt(fragment.getAttribute('data-fragment-index'))));
      this.triggerTransition(iframe, Math.max(...allFragmentsIndices), 'forward');
    }
  }

  isNavigationBack(currentSlide, previousSlide) {
    const idxCurrent = this.deck.getIndices(currentSlide);
    const idxPrevious = this.deck.getIndices(previousSlide);
    return (idxCurrent.h < idxPrevious.h) || (idxCurrent.v < idxPrevious.v);
  }

  triggerAllTransitions(allIframes, currentStep, direction) {
    allIframes.forEach(iframe => this.triggerTransition(iframe, currentStep, direction));
  }

  triggerTransition(iframe, currentStep, direction) {
    if (direction === "forward") {
      if (iframe.transitionSteps && iframe.transitionSteps[currentStep]) {
        iframe.transitionSteps[currentStep].transitionForward();
      }
    } else {
      if (iframe.transitionSteps && iframe.transitionSteps[currentStep]) {
        iframe.transitionSteps[currentStep].transitionBackward();
      }
    }
  }

  triggerOnSlideChangeTransition(allIframes) {
    allIframes.forEach(iframe => {
      if (iframe.transitionOnSlideChange) {
        iframe.transitionOnSlideChange.transitionForward();
      }
    });
  }

  handleFragments(event, direction) {
    let currentStep = parseInt(event.fragments[0].getAttribute('data-fragment-index'));
    const slide = event.fragment.closest('section');
    let allIframes = this.getAllIframes(slide);
    this.triggerAllTransitions(allIframes, currentStep, direction);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const vizzy = new Vizzy({
    transitionDuration: 500,
    autoRunTransitions: true
  });
  Reveal.on('ready', event => vizzy.init(Reveal));
});
