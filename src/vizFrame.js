class VizFrame {
  constructor(src, isBackground, vizzyContainer, slideIndex, id, devMode=false, delay=0) {
    this.src = src;
    this.index = slideIndex;
    this.id = id;
    this.isBackground = isBackground;
    this.vizzyContainer = vizzyContainer;
    this.iframe = this.createIframe();
    this.loaded = false;
    this.observer = this.createMutationObserver();
    this.dev = devMode;
    this.delay = delay || 0;
    this.fragmentList = [];
    this.keyAccess = true;
    this.iframeFocused = false;

    this.show(); // append to vizzy
    // Note, for non-backgrounds, this will bind iframes to vizzy and Reveal's 
    // lazy-load mechanism will take over. 
    // For background elements, the vizzyContainer node is not bound anywhere 
    // on the page, so it will not show. The vizzy plugin object needs to 
    // handle the showing/hiding within the reveal viewDistance if we want
    // to maintain similar lazy-load functionality.
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

    // Event listener for propagating keydown events
    iframe.addEventListener('load', () => {
      const iframeWindow = iframe.contentWindow || iframe.contentDocument;
      try {
        iframeWindow.addEventListener('keydown', (event) => {
          const customEvent = new CustomEvent('iframe-keydown', { detail: event });
          window.parent.dispatchEvent(customEvent); // send to parent window
          // Reveal.layout();
        });
      } catch (e) {
        this.keyAccess = false;
        this.log(`Error accessing iframe window for ${this.src}: ${e.message}`, 'createIframe');
      } finally {
        if (!this.keyAccess) {
          // Event listener for propagating keydown events
          iframe.addEventListener('focus', () => {
            this.iframeFocused = true;
            this.log(`Iframe focused: ${this.src}`, 'createIframe');
          });

          iframe.addEventListener('blur', () => {
            this.iframeFocused = false;
            this.log(`Iframe blurred: ${this.src}`, 'createIframe');
          });
          // Listen to keydown events on the parent window
          window.addEventListener('keydown', (event) => {
            if (this.iframeFocused) {
              const customEvent = new CustomEvent('iframe-keydown', { detail: event });
              window.parent.dispatchEvent(customEvent); // send to parent window
            }
          }, false);
        }
      }
    });

    return iframe;
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
      }, this.delay);
    }
  }

  handleSrcRemoved() {
    // You can add any additional logic here if needed when src is removed
    this.log(`Src attribute is removed, content unloaded (slide ${this.getIndex('linear')})`, 'handleSrcRemoved');
  }

  // Toggles render state
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