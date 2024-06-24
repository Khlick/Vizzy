const gulp = require('gulp');
const rollup = require('rollup'); // For bundling JavaScript
const resolve = require('@rollup/plugin-node-resolve').nodeResolve; // For resolving node modules
const commonjs = require('@rollup/plugin-commonjs'); // For converting CommonJS modules to ES6
const { babel: rollupBabel } = require('@rollup/plugin-babel'); // For using Babel with Rollup
const terser = require('@rollup/plugin-terser'); // For minifying the bundle

// Babel configuration for both UMD and ESM builds
const babelConfig = {
  babelHelpers: 'bundled',
  ignore: ['node_modules'],
  compact: false,
  extensions: ['.js'],
  plugins: [
    'transform-html-import-to-string'
  ],
  presets: [
    ['@babel/preset-env', {
      corejs: 3,
      useBuiltIns: 'usage',
      modules: false
    }]
  ]
};

// Specific Babel configuration for ES module build
const babelConfigESM = JSON.parse(JSON.stringify(babelConfig));
babelConfigESM.presets[0][1].targets = {
  browsers: [
    'last 2 Chrome versions',
    'last 2 Safari versions',
    'last 2 iOS versions',
    'last 2 Firefox versions',
    'last 2 Edge versions'
  ]
};

// Cache to improve build performance by reusing previous results
let cache = {};

// Task to build the Vizzy plugin
gulp.task('build:vizzy', () => {
  return rollup.rollup({
    cache: cache['src/plugin.js'],
    input: 'src/plugin.js',
    plugins: [
      resolve({
        browser: true,
        preferBuiltins: false,
        extensions: ['.js', '.json'] // Add JSON extension for core-js
      }),
      commonjs(),
      rollupBabel({
        ...babelConfig,
        babelHelpers: 'bundled', // Ensure Babel helpers are bundled
        extensions: ['.js'], // Ensure Babel processes JavaScript files
        exclude: 'node_modules/**', // Exclude node_modules
      }),
      terser() // Minify the output
    ]
  }).then(bundle => {
    cache['src/plugin.js'] = bundle.cache;

    // Write ES module version
    bundle.write({
      file: 'dist/vizzy.esm.js',
      name: 'Vizzy',
      format: 'es'
    });

    // Write UMD version
    bundle.write({
      file: 'dist/vizzy.js',
      format: 'umd',
      name: 'Vizzy'
    });
  });
});

// Task to copy the built files to the tests directory
gulp.task('copy:dist', () => {
  return gulp.src('dist/*')
    .pipe(gulp.dest('tests/'));
});

// Default task: clean, build, and copy the files
gulp.task('default', gulp.series('build:vizzy'));
