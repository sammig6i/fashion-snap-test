const path = require('path');

module.exports = {
  entry: {
    popup: path.resolve(__dirname, 'frontend/src/popup.js'),
    content: path.resolve(__dirname, 'frontend/src/content.js'),
    background: path.resolve(__dirname, 'frontend/src/background.js')
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  devtool: 'inline-source-map',
  mode: 'production',
  experiments: {
    asyncWebAssembly: true,
  }
};
