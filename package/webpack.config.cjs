const path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: 'main.js',
    publicPath: '',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    library: {
      name: 'planettech',
      type: 'umd',
    },
  },
};