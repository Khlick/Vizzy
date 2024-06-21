class VizFrame {
  constructor(src, isBackground, vizzyContainer, slideIndex, id, devMode=false, delay=0) {
    this.src = src;
    this.index = slideIndex;
    this.id = id;
    this.isBackground = isBackground;
    this.vizzyContainer = vizzyContainer;
    this.iframe = this.createIframe();
    this.setOnLoad();
    this.loaded = false;
    this.observer = this.createMutationObserver();
    this.dev = devMode;
    this.delay = delay || 0;
    this.fragmentList = [];
    this.keyAccess = true;
    this.iframeFocused = false;

    this.show(); // append to vizzy
  }

  createIframe() {
    const iframe = document.createElement('iframe');
    // Set to data-src to make it compatible with reveal's lazy load. This way,
    // the iframe content won't load until Reveal modifies the iframe attrs.
    // For backgrounds, we use src so we can append and remove the vizzy element
    // from the backgrounds content (reveal).
    iframe.setAttribute('data-src', this.src); 
    iframe.sandbox = 'allow-popups allow-scripts allow-forms allow-same-origin';
    
    // handle full screen
    iframe.setAttribute( 'allowfullscreen', '' );
    iframe.setAttribute( 'mozallowfullscreen', '' );
    iframe.setAttribute( 'webkitallowfullscreen', '' );

    // Apply data- attributes to the iframe
    Array.from(this.vizzyContainer.attributes).forEach(attr => {
      if (attr.name.startsWith('data-') && (attr.name != "data-src")) {
        iframe.setAttribute(attr.name.replace('data-', ''), attr.value);
      }
    });

    return iframe;
  }

  setOnLoad() {
    const iframe = this.iframe;
    // Event listener for propagating keydown events
    iframe.addEventListener('load', () => {
      this.loaded = true;
      const iframeWindow = iframe.contentWindow || iframe.contentDocument;
      try {
        iframeWindow.addEventListener('keydown', (event) => {
          const customEvent = new CustomEvent('iframe-keydown', { detail: event });
          window.parent.dispatchEvent(customEvent); // send to parent window
          Reveal.layout();
        });
      } catch (e) {
        this.log(`Error accessing iframe window for ${this.src}: ${e.message}`, 'createIframe');
      }
    });
  }
  // GET/SET METHODS
  getIndex(key="linear") {
    return this.index.hasOwnProperty(key) ? this.index[key] : -1;
  }
  setFragmentList(list = []) {
    this.fragmentList = [...list];
  }

  // Callbacks
  createMutationObserver() {
    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          if (this.iframe.hasAttribute('src')) {
            // The src attribute is being set
            this.handleSrcSet();
          } else {
            // The src attribute is being removed
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
        // Check if the iframe is cross-origin
        try {
          if (this.iframe.contentWindow) {
            this.iframe.contentWindow.location.reload();
          } else {
            throw new Error('Cross-origin iframe or inaccessible contentWindow');
          }
        } catch (e) {
          if (e instanceof DOMException && e.name === 'SecurityError' || e.message.includes('inaccessible contentWindow')) {
            this.log(`Cross-origin iframe detected, reloading with workaround`, 'show');
            // Workaround: Remove and reattach the iframe for cross-origin iframes
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
    // You can add any additional logic here if needed when src is removed
    this.log(`Src attribute is removed, content unloaded (slide ${this.getIndex('linear')})`, 'handleSrcRemoved');
  }

  // Toggles render state
  waitForLoad() {
    return new Promise((resolve) => {
      if (this.loaded) {
        resolve();
      } else {
        this.iframe.addEventListener('load', () => resolve(), { once: true });
      }
    });
  }

  show() {
    if (!this.vizzyContainer.contains(this.iframe)) {
      this.vizzyContainer.appendChild(this.iframe);
    }
    this.loaded = true;
  }
  hide() {
    if (this.vizzyContainer.contains(this.iframe)) {
      this.vizzyContainer.removeChild(this.iframe);
    }
    this.loaded = false;
  }
  toggle() {
    if (this.loaded) {
      this.hide();
    } else {
      this.show();
    }
    
  }
  // logging method
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