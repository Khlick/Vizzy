const path = require('path');

module.exports = {
  entry: './src/vizzy.js',
  output: {
    filename: 'vizzy.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'Vizzy',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};
