class Vizzy {
  constructor(config = {}) {
    this.config = {
      transitionDuration: config.transitionDuration || 300,
      autoRunTransitions: config.autoRunTransitions || false,
      printPDFMode: config.printPDFMode || false,
      devMode: config.devMode || false,
      onSlideChangedDelay: config.onSlideChangedDelay || 0,
      ...config
    };
    this.iframes = [];
    this.id = "Vizzy";
  }

  log(message, id = null) {
    if (this.config.devMode) {
      console.log(`[Vizzy${id ? ':' + id : ''}] ${message}`);
    }
  }

  init(Reveal) {
    this.log('Invoking init method');
    this.Reveal = Reveal;
    this.config = { ...this.config, ...this.Reveal.getConfig().vizzy };
    this.log('Configuration after merging with Reveal config: ' + JSON.stringify(this.config));
    this.loadIframes();
    this.handleFragments();
    this.checkPrintMode();
    this.setupKeydownPropagation();
    this.setupSlideChanged();
    this.log('Terminating init method');
  }

  loadIframes() {
    this.log('Invoking loadIframes method');
    const vizzyElements = document.querySelectorAll('vizzy[data-location]');
    vizzyElements.forEach((element, index) => {
      const iframe = document.createElement('iframe');
      iframe.src = element.dataset.location;
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      element.appendChild(iframe);
      this.iframes.push(iframe);

      // Add event listener to propagate keydown events from iframe to parent
      iframe.addEventListener('load', () => {
        iframe.contentWindow.addEventListener('keydown', (event) => {
          const customEvent = new CustomEvent('iframe-keydown', { detail: event });
          window.document.dispatchEvent(customEvent);
        });
      });

      this.log(`Iframe loaded from ${iframe.src}`, index);
    });
    this.log('Terminating loadIframes method');
  }

  handleFragments() {
    this.log('Invoking handleFragments method');
    this.Reveal.on('fragmentshown', event => {
      const fragment = event.fragment;
      const iframe = fragment.closest('section').querySelector('iframe');
      if (iframe) {
        const fragmentIndex = parseInt(fragment.getAttribute('data-fragment-index'));
        iframe.contentWindow.postMessage({ type: 'fragment', direction: 'forward', fragmentIndex }, '*');
        this.log(`Fragment shown: index ${fragmentIndex}`);
      }
    });

    this.Reveal.on('fragmenthidden', event => {
      const fragment = event.fragment;
      const iframe = fragment.closest('section').querySelector('iframe');
      if (iframe) {
        const fragmentIndex = parseInt(fragment.getAttribute('data-fragment-index'));
        iframe.contentWindow.postMessage({ type: 'fragment', direction: 'backward', fragmentIndex }, '*');
        this.log(`Fragment hidden: index ${fragmentIndex}`);
      }
    });
    this.log('Terminating handleFragments method');
  }

  checkPrintMode() {
    this.log('Invoking checkPrintMode method');
    if (window.location.search.match(/print-pdf/gi)) {
      this.config.printPDFMode = true;
      this.log('Print PDF mode detected');
      if (this.config.autoRunTransitions) {
        this.runTransitions();
      }
    }
    this.log('Terminating checkPrintMode method');
  }

  runTransitions() {
    this.log('Invoking runTransitions method');
    this.iframes.forEach((iframe, index) => {
      iframe.contentWindow.postMessage({ type: 'run-transitions' }, '*');
      this.log(`Running transitions in iframe: ${iframe.src}`, index);
    });
    this.log('Terminating runTransitions method');
  }

  setupKeydownPropagation() {
    this.log('Setting up keydown propagation from iframe to parent');
    // propagate keydown when focus is on iframe (child)
    // https://stackoverflow.com/a/41361761/2503795
    window.document.addEventListener('iframe-keydown', (event) => {
      this.Reveal.triggerKey(event.detail.keyCode);
      this.log(`Propagated keydown event: keyCode ${event.detail.keyCode}`);
    }, false);
    this.log('Keydown propagation setup complete');
  }

  setupSlideChanged() {
    this.log('Setting up slide changed event listener');
    this.Reveal.on('slidechanged', event => {
      this.log('Slide changed event detected');
      setTimeout(() => {
        this.log('Executing delayed slide changed transitions');
        const iframe = event.currentSlide.querySelector('iframe');
        if (iframe) {
          iframe.contentWindow.postMessage({ type: 'slidechanged' }, '*');
          this.log(`Slide changed transition executed in iframe: ${iframe.src}`);
        }
      }, this.config.onSlideChangedDelay);
    });
    this.log('Slide changed event listener setup complete');
  }
}

export default Vizzy;
