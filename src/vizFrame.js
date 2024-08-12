class VizFrame {
  constructor(src, isBackground, vizzyContainer, slideIndex, id, devMode = false, delay = 0) {
    this.src = src;
    this.index = slideIndex;
    this.id = id;
    this.isBackground = isBackground;
    this.vizzyContainer = vizzyContainer;
    this._fragmentsObject = null; // Use a private property
    this.fragmentList = [];
    this.loaded = false;

    // Bind methods to 'this' context
    this.onVizzyLoaded = this.onVizzyLoaded.bind(this);

    this.iframe = this.createIframe();
    this.dev = devMode;
    this.delay = delay || 0;
  }

  // Initialize the VizFrame instance
  async init() {
    return new Promise(async (resolve, reject) => {
      try {
        this.log(`Starting initialization for VizFrame ${this.index.linear}`, 'init');

        // Show the iframe immediately and trigger the src loading
        this.show();
        this.toggleSrc(true);

        // Wait for the iframe to load and parse fragments
        await this.waitForLoad();
        this.log(`Loaded iframe for VizFrame ${this.index.linear}`, 'init');

        await this.parseFragments();
        this.log(`Parsed fragments for VizFrame ${this.index.linear}`, 'init');

        // Unbind the iframe src attribute
        this.toggleSrc(false);
        this.setOnLoad(); // Set the main event listener
        this.observer = this.createMutationObserver();

        this.log(`Initialization complete for VizFrame ${this.index.linear}`, 'init');
        // Resolve the promise indicating successful initialization
        resolve();
      } catch (error) {
        // Reject the promise if an error occurs during initialization
        this.log(`Error during initialization: ${error.message}`, 'init');
        reject(error);
      }
    });
  }

  createIframe() {
    const iframe = document.createElement('iframe');
    // Set to data-src to make it compatible with reveal's lazy load. This way,
    // the iframe content won't load until Reveal modifies the iframe attrs.
    iframe.setAttribute('data-src', this.src);
    iframe.sandbox = 'allow-popups allow-scripts allow-forms allow-same-origin';

    // Handle full screen
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('mozallowfullscreen', '');
    iframe.setAttribute('webkitallowfullscreen', '');

    // Apply data- attributes to the iframe
    Array.from(this.vizzyContainer.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && attr.name !== "data-src") {
        iframe.setAttribute(attr.name.replace('data-', ''), attr.value);
      }
    });

    return iframe;
  }

  setOnLoad() {
    // Set up the main event listener for the iframe
    this.iframe.addEventListener('load', this.onVizzyLoaded);
  }

  async onVizzyLoaded() {
    const iframeWindow = this.iframe.contentWindow || this.iframe.contentDocument;
    if (!this.isCrossOrigin()) {
      try {
        iframeWindow.addEventListener('keydown', (event) => {
          const customEvent = new CustomEvent('iframe-keydown', {
            detail: event
          });
          window.parent.document.dispatchEvent(customEvent); // send to parent window
        });
      } catch (e) {
        this.log(`Error accessing iframe window for ${this.src}: ${e.message}`, 'onVizzyLoaded');
      }
    } else {
      this.log(`Source '${this.src}' is cross-origin.`, 'onVizzyLoaded');
    }
    this.loaded = true;
  }

  async parseFragments() {
    const iframeWindow = this.iframe.contentWindow || this.iframe.contentDocument;

    if (!this.isCrossOrigin()) {
      // Access the fragments object via the getter
      const fragments = this.fragmentsObject;

      if (fragments && fragments.length > 0) {
        const fragmentList = [];
        const usedIndices = new Set();

        fragments.forEach((frag, i) => {
          if (!frag.activate) {
            const errorMessage = `Iframe source ${this.src} has a fragment without an 'activate' method at index ${i}`;
            this.log(errorMessage, 'parseFragments');
            throw new Error(errorMessage);
          }

          const validKeys = ['activate', 'deactivate', 'reverse', 'index'];
          const fragKeys = Object.keys(frag);
          const invalidKeys = fragKeys.filter(key => !validKeys.includes(key));
          const methods = fragKeys.filter(key => validKeys.includes(key) && key !== 'index');

          if (invalidKeys.length > 0) {
            this.log(`Iframe source ${this.src} has unapproved fields: ${invalidKeys.join(', ')}`, 'parseFragments');
          }

          const index = frag.index !== undefined ? frag.index : i;
          if (usedIndices.has(index)) {
            let newIndex = 0;
            while (usedIndices.has(newIndex)) newIndex++;
            fragmentList.push({
              index: newIndex,
              methods
            });
            usedIndices.add(newIndex);
          } else {
            fragmentList.push({
              index,
              methods
            });
            usedIndices.add(index);
          }
        });

        fragmentList.sort((a, b) => a.index - b.index);
        this.fragmentList = fragmentList;
        this.log(`Extracted and validated ${fragmentList.length} fragments for ${this.src}`, 'parseFragments');
      } else {
        this.log(`No fragments found for ${this.src}!`, 'parseFragments');
      }
    } else {
      this.log(`Skipping fragment parsing for cross-origin source '${this.src}'`, 'parseFragments');
    }
  }

  // Getter for fragmentsObject
  get fragmentsObject() {
    const iframeWindow = this.iframe.contentWindow || this.iframe.contentDocument;
    return this.initializefragmentsObjectect(iframeWindow);
  }

  initializefragmentsObjectect(iframeWindow) {
    const inlineCode = this.vizzyContainer.querySelector('span[data-vizzy-fragments]');
    let fragmentsObject = null;
    if (inlineCode) {
      this.log("Vizzy has inline code!", 'initializefragmentsObject');
      const code = inlineCode.textContent;
      fragmentsObject = this.executeInlineScript(code, iframeWindow);
    } else if (iframeWindow._fragments) {
      this.log("Vizzy has _fragments object!", 'initializefragmentsObject');
      fragmentsObject = iframeWindow._fragments;
    }

    this._fragmentsObject = fragmentsObject || [];
    return fragmentsObject || [];
  }

  executeInlineScript(script, iframeWindow) {
    let output = [];
    if (iframeWindow) {
      try {
        output = new Function('window', `return (${script})`)(iframeWindow);
      } catch (e) {
        this.log(`Error executing inline script: ${e.message}`, 'executeInlineScript');
      }
    }
    return output;
  }

  // Check if the iframe is cross-origin
  isCrossOrigin() {
    try {
      const iframeUrl = new URL(this.iframe.src, window.location.href);

      // Check if the protocol is 'file:', which indicates a local file
      if (iframeUrl.protocol === 'file:') {
        return false; // Local files are not cross-origin
      }

      // Compare origins for web-based URLs
      return iframeUrl.origin !== window.location.origin;
    } catch (e) {
      // If an error is caught, it's likely because of cross-origin restrictions
      return true;
    }
  }

  waitForLoad() {
    return new Promise((resolve) => {
      this.iframe.addEventListener('load', () => resolve(), {
        once: true
      });
    });
  }

  show() {
    if (!this.vizzyContainer.contains(this.iframe)) {
      this.vizzyContainer.appendChild(this.iframe);
    }
    this.loaded = true;
  }

  toggleSrc(status = null) {
    if (status === null) {
      status = !this.iframe.hasAttribute("src") || this.iframe.getAttribute("src") === "";
    }

    if (status) {
      this.iframe.setAttribute("src", this.iframe.getAttribute("data-src"));

      if (this.isBackground) {
        // Temporarily append the vizzyContainer to the document to trigger the iframe load
        document.body.appendChild(this.vizzyContainer);
      }
    } else if (this.iframe.hasAttribute("src")) {
      this.iframe.removeAttribute('src');

      if (this.isBackground) {
        // Remove the vizzyContainer from the document after the iframe has been loaded
        document.body.removeChild(this.vizzyContainer);
      }
    }
  }

  createMutationObserver() {
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          if (this.iframe.hasAttribute('src')) {
            this.handleSrcSet();
          } else {
            this.handleSrcRemoved();
          }
        }
      }
    });

    observer.observe(this.iframe, {
      attributes: true,
      attributeFilter: ['src']
    });

    return observer;
  }

  handleSrcSet() {
    this.log(`Src attribute is set, loading content (slide ${this.getIndex('linear')})`, 'handleSrcSet');
    if (this.delay) {
      this.hide();
      setTimeout(() => {
        this.show();
        const iframeWindow = this.iframe.contentWindow || this.iframe.contentDocument;
        try {
          if (iframeWindow) {
            iframeWindow.location.reload();
          } else {
            throw new Error('Cross-origin iframe or inaccessible contentWindow');
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'SecurityError' || e.message.includes('inaccessible contentWindow')) {
            this.log(`Cross-origin iframe detected, reloading with workaround`, 'handleSrcSet');
            const parent = this.iframe.parentElement;
            const newIframe = this.iframe.cloneNode();
            parent.removeChild(this.iframe);
            parent.appendChild(newIframe);
            this.iframe = newIframe;
            this.setOnLoad();
          } else {
            throw e; // Re-throw if it's not a cross-origin issue
          }
        }
      }, this.delay);
    }
  }

  handleSrcRemoved() {
    this.log(`Src attribute is removed, content unloaded (slide ${this.getIndex('linear')})`, 'handleSrcRemoved');
  }

  // Return the index based on the provided key
  getIndex(key = "linear") {
    return this.index.hasOwnProperty(key) ? this.index[key] : -1;
  }

  log(message, id = null) {
    if (this.dev) {
      if (id === null) {
        const error = new Error();
        const stack = error.stack.split('\n');
        id = stack[2] ? stack[2].trim().split(' ')[1] : null;
      }
      console.log(`[Vizzy:VizFrame${id ? ":" + id : ""}] ${message}`);
    }
  }
}

export default VizFrame;