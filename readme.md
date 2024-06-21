# Vizzy Plugin for Reveal.js

Vizzy is a plugin for Reveal.js that allows you to embed iframes and interact with external content seamlessly within your presentations. 

## Features

- Embed external web pages within your slides.
- Automatically manage iframe loading and transitions.
- Support for fragments to handle step-by-step animations and transitions.

## Motivation

While a graduate student at UCLA, I had the opportunity to teach statistics to other graduate students and undergraduates. During this time, I met Dr. Guillaume Calmettes, who shared my vision of improving how we teach statistics, particularly to pre-med students. We found that PowerPoint lacked the interactivity we needed to drive home points about statistical distributions, resampling methods, and probability. Moreover, we found that Jupyter notebooks and R Shiny applications were too difficult to share.

I loved Reveal.js and had been experimenting with embedding Shiny apps in the presentations, but that was too much work. We turned to D3.js and initially wrote scripts for our visualizations directly in the presentation, but this also became cumbersome and difficult to share and maintain. Guillaume discovered the plugin by Joscha Legewie ([reveal.js-d3js-plugin](https://github.com/jlegewie/reveal.js-d3js-plugin)) and started developing his own version ([reveal.js-d3](https://github.com/gcalmettes/reveal.js-d3)). This allowed us to work on visualizations independently and place them in the presentation cleanly.

Fast-forward 7 years, I found myself teaching again, this time as an adjunct professor at California State University, Los Angeles, teaching Experimental Methods to Mechanical Engineering students and Mechanisms of Neural Plasticity to Kinesiology students. Realizing that Reveal.js had evolved, I needed the same functionality but found several issues that required constant patching and tweaking. Eventually, I set out to create Vizzy.

Vizzy is based on the reveal.js-d3 and reveal.js-d3js plugins, incorporating similar functionality but with key differences in syntax and under-the-hood approaches. Vizzy works with both Reveal.js 4 and 5, integrates with Reveal's lazy-load mechanisms, allows for further customization of the iframe container, and better integrates with the fragments mechanism to allow for auto-running fragments when traversing backwards through slide decks. Vizzy is available in both module and non-module versions. Future directions include a mechanism to control fragments in the Vizzy source from the host and properly registering Vizzy elements. This first version is primarily a proof of concept and an upgrade from previous plugins, and I hope to optimize it further and gather insights from other developers.

## Installation

Install Vizzy via npm:

```sh
npm install vizzy
```

## Usage

### Basic Setup

Add the Vizzy plugin to your Reveal.js presentation:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reveal.js Presentation</title>
  <link rel="stylesheet" href="reveal.css">
  <script src="reveal.js"></script>
  <script src="vizzy.js"></script>
</head>
<body>
  <div class="reveal">
    <div class="slides">
      <section>
        <h2>Slide 1</h2>
        <p>This is the first slide.</p>
      </section>
      <section>
        <h2>This is a second slide</h2>
        <p class="fragment" data-fragment-index="1">With fragments!</p>
        <vizzy data-src="lib/visualizations/collision-detection.html" style="height:600px;"></vizzy>
      </section>
      <section>
        <h2>This is a third slide</h2>
        <div>
          <p>Some content here.</p>
          <p>$\bar{x} = \frac{1}{N}\sum_{i=0}^{N}x_i$</p>
        </div>
      </section>
    </div>
  </div>
  <script>
    Reveal.initialize({
      plugins: [ Vizzy ]
    });
  </script>
</body>
</html>
```

### Adding Vizzy Elements

You can add Vizzy elements to your slides using the `<vizzy>` tag. Set the `data-src` attribute to the URL of the content you want to embed.

```html
<section>
  <h2>Vizzy with Fragments</h2>
  <vizzy data-src="lib/visualizations/collision-detection.html" style="height:600px;"></vizzy>
</section>
```

### Using Fragments with Vizzy

You can use fragments to create step-by-step transitions within your Vizzy iframes. Define the `_fragments` array in your iframe content.

```html
<!-- collision-detection.html -->
<script>
  window._fragments = [
    {
      activate: () => {
        console.log("Fragment 1 activated");
        // Do something to animation
      },
      reverse: () => {
        console.log("Fragment 1 reversed");
        // Undo something in animation
      },
      index: 0
    },
    {
      activate: () => {
        console.log("Fragment 2 activated");
        // Do another thing in animation
      },
      reverse: () => {
        console.log("Fragment 2 reversed");
        // Undo another thing in animation
      },
      index: 1
    }
  ];
</script>
```

## Configuration

You can configure Vizzy by passing options to the plugin:

```javascript
Reveal.initialize({
  plugins: [ Vizzy ],
  vizzy: {
    autoRunTransitions: true,  // Automatically run transitions
    autoTransitionDelay: 100,  // Delay between transitions (ms)
    devMode: false,            // Enable development mode
    onSlideChangedDelay: 0     // Delay before handling slide change (ms)
  }
});
```

## License

This project is licensed under the (MIT License)[./LICENSE].
