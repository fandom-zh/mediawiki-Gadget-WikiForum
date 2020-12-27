'use strict'

const path = require('path')

const isMinify = process.env.MINIFY

module.exports = {
  entry: {
    'WikiForum.core': './index.js',
    'WikiForum.render.default': './render/default.js',
  },
  context: path.resolve(__dirname),
  watchOptions: {
    ignored: /(node_modules|dist)/,
  },
  mode: isMinify ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isMinify ? '[name].min.js' : '[name].js',
    // publicPath: 'pathOrUrlWhenProductionBuild'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: '/node_modules/',
      },
    ],
  },
  resolve: {},
  devtool: 'source-map',
  plugins: [],
  optimization: {
    minimize: isMinify ? true : false,
  },
}
