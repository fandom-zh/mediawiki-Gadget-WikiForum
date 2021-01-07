'use strict'

const path = require('path')
const webpack = require('webpack')
const version = require('./package.json').version

const isMinify = process.env.MINIFY

const bannerText = `/**
 * @name [name]
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @description Provide a front-end structured discussion page with JavaScript.
 *              Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Wjghj-Project/Gadget-WikiForum
 */
`

const BannerPlugin = new webpack.BannerPlugin({
  entryOnly: true,
  raw: true,
  banner: bannerText,
})

module.exports = {
  entry: {
    'WikiForum.core': './index.js',
    'WikiForum.theme.default': './theme/default/default.js',
  },
  target: ['web', 'es5'],
  context: path.resolve(__dirname),
  watchOptions: {
    ignored: /(node_modules|dist)/,
  },
  mode: isMinify ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'public', 'dist'),
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
  plugins: [BannerPlugin],
  optimization: {
    minimize: isMinify ? true : false,
  },
}
