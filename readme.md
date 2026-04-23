# Vizzy — Reveal.js iframe and fragment bridge

Vizzy is a [Reveal.js](https://revealjs.com/) plugin that embeds external pages in `<vizzy>` elements and wires Reveal’s **fragment** events to optional callbacks inside each iframe (`activate`, `reverse`, `deactivate`). It is distributed as UMD and ESM builds.

## Reveal.js compatibility

Vizzy is exercised against **Reveal.js 4.x**, **5.x**, and **6.x** (including **6.0.1**). The plugin listens for `fragmentshown`, `fragmenthidden`, and `slidechanged` and reads `event.fragment` / `event.detail.fragment` where needed so it works across these major versions.

## How Reveal shows and hides fragments (and why Vizzy orders callbacks this way)

Reveal’s fragment controller (for example in `js/controllers/fragments.js` in the Reveal source) updates the DOM when the fragment index changes: it toggles `.visible` / `.current-fragment` on fragment elements, updates `slide.dataset.fragment` (clamped between **-1** and the highest fragment index), then dispatches events. In current Reveal, **`fragmenthidden` is fired before `fragmentshown`** when both apply in one step.

Vizzy mirrors that ordering for **backward** navigation: on `fragmenthidden`, when the leaving fragment index is greater than the new slide fragment index, Vizzy runs **`deactivate`** on the **leaving** index for every Vizzy on the slide, then **`reverse`** on that same index. It sets an internal flag so the following **`fragmentshown`** does **not** call **`activate`** on the arriving index (Reveal still shows the fragment in the DOM; Vizzy deliberately does not re-run `activate` when stepping backward).

For **forward** navigation, on `fragmentshown`, Vizzy runs **`deactivate`** on the **previous** cursor index for all Vizzies on the slide, then **`activate`** on the **arriving** index. **`deactivate`** may return a `Promise`; Vizzy **awaits** it before continuing.

### Index `-1` (auto-run / pre-step)

- **`reverse` is never called** for fragment indices **&lt; 0** (including `-1`).
- If you define **`deactivate`** on the **`-1`** entry, it runs when the deck **advances from the implicit “before first fragment” state into fragment `0`**: the first forward `fragmentshown` treats the previous index as **`-1`**, so Vizzy calls **`deactivate(-1)`** and then **`activate(0)`**. You do **not** need a dummy Reveal fragment at index `0` solely for that behavior; Vizzy performs the `-1` deactivation explicitly.
- **`activate(-1)`** still runs for immediate / auto-run steps (for example after `slidechanged` when `vizzyImmediateFragments` is set).

## Features

- Embed external pages with `data-src` on `<vizzy>`; optional `data-*` attributes are copied to the generated iframe.
- Lazy loading aligned with Reveal’s slide visibility where applicable.
- **Fragments**: map Reveal `data-fragment-index` steps to iframe logic via `window._fragments` or inline JSON on `<vizzy>`.
- **Background slides**: Vizzies in slide backgrounds are mounted and kept across `Reveal.sync()` where possible.

## Motivation

While a graduate student at UCLA, I had the opportunity to teach statistics to other graduate students and undergraduates. During this time, I met Dr. Guillaume Calmettes, who shared my vision of improving how we teach statistics, particularly to pre-med students. We found that PowerPoint lacked the interactivity we needed to drive home points about statistical distributions, resampling methods, and probability. Moreover, we found that Jupyter notebooks and R Shiny applications were too difficult to share.

I loved Reveal.js and had been experimenting with embedding Shiny apps in the presentations, but that was too much work. We turned to D3.js and initially wrote scripts for our visualizations directly in the presentation, but this also became cumbersome and difficult to share and maintain. Guillaume discovered the plugin by Joscha Legewie ([reveal.js-d3js-plugin](https://github.com/jlegewie/reveal.js-d3js-plugin)) and started developing his own version ([reveal.js-d3](https://github.com/gcalmettes/reveal.js-d3)). This allowed us to work on visualizations independently and place them in the presentation cleanly.

Fast-forward several years, I found myself teaching again, this time as an adjunct professor at California State University, Los Angeles, teaching Experimental Methods to Mechanical Engineering students and Mechanisms of Neural Plasticity to Kinesiology students. Realizing that Reveal.js had evolved, I needed the same functionality but found several issues that required constant patching and tweaking. Eventually, I set out to create Vizzy.

Vizzy is based on the reveal.js-d3 and reveal.js-d3js plugins, incorporating similar functionality but with key differences in syntax and under-the-hood approaches. Vizzy is available in both module and non-module versions.

## Installation

```sh
npm install vizzy-reveal
```


## Usage

### Basic setup

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
        <h2>A Vizzy slide</h2>
        <p class="fragment" data-fragment-index="0">First step</p>
        <vizzy data-src="lib/visualizations/collision-detection.html" style="height:600px;"></vizzy>
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

### `<vizzy>` element

Set `data-src` to the page URL. Style the host like any block element. Attributes prefixed with `data-` on `<vizzy>` are applied to the iframe (for example `data-scrolling="no"`).

The plugin injects baseline CSS so the iframe fills the `<vizzy>` host and background vizzies fill the background container.

### Fragments inside the iframe (`window._fragments`)

In the embedded document, define **`window._fragments`** as an array of objects:

| Field        | Required | Purpose |
|-------------|----------|---------|
| `index`     | Yes      | Matches Reveal’s `data-fragment-index` on the generated `.vizzy-fragment` span for that slide. Use **`-1`** for a step that runs when the slide becomes current (before fragment `0`). |
| `activate`  | Yes      | Called when advancing **to** this index (after `deactivate` of the previous index on forward steps). |
| `reverse`   | No       | Called when stepping **backward** from this index. **Not used for `index < 0`.** |
| `deactivate`| No       | Called when leaving this index on a **forward** step, or as part of backward handling for the **leaving** index. May be sync or async (`Promise`). |

Example:

```html
<!-- collision-detection.html -->
<script>
  window._fragments = [
    {
      index: -1,
      activate: () => { console.log('Slide visible, pre-fragment'); },
      deactivate: () => { console.log('Leaving -1 before fragment 0'); }
    },
    {
      index: 0,
      activate: () => { console.log('Fragment 0'); },
      reverse: () => { console.log('Undo 0'); },
      deactivate: () => { console.log('Cleanup before next index'); }
    },
    {
      index: 1,
      activate: () => { console.log('Fragment 1'); },
      reverse: () => { console.log('Undo 1'); }
    }
  ];
</script>
```

### Fragments inline on `<vizzy>`

You can embed a JavaScript array expression as text content inside `<vizzy>` (the plugin evaluates it with the iframe’s `contentWindow` as `window`). The shape matches `_fragments` (`activate`, optional `reverse` / `deactivate`, `index`).

```html
<vizzy data-src="lib/viz/bar-chart.html" class="grid-item">
  [
    {
      activate: () => window.render("math"),
      reverse: () => window.render("language"),
      index: 1
    }
  ]
</vizzy>
```

Treat inline fragment code like any other dynamically evaluated script: only use it with trusted content.

## Configuration

```javascript
Reveal.initialize({
  plugins: [ Vizzy ],
  vizzy: {
    autoRunTransitions: true,
    autoTransitionDelay: 100,
    devMode: false,
    onSlideChangedDelay: 0
  }
});
```

| Option                 | Type    | Default | Description |
|------------------------|---------|---------|-------------|
| `autoRunTransitions` | Boolean | `false` | When `true`, after navigating to a slide that already has a positive `data-fragment`, Vizzy replays `activate` from `0` through that index (each step preceded by `deactivate` of the previous index). Also used in print-style flows where applicable. |
| `autoTransitionDelay`  | Number  | `100`   | Delay between automatic replay steps (ms). |
| `devMode`              | Boolean | `false` | Extra console logging. |
| `onSlideChangedDelay`  | Number  | `0`     | Delay before slide-change handling (ms). |

## License

This project is licensed under the [MIT License](LICENSE).
