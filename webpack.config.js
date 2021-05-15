'use strict'

const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const { readdirSync } = require('fs')

const isMinify = process.env.MINIFY

// Make banner
const bannerText = `/**
 * @name [name]
 * @version ${require('./package.json').version} (Core version)
 * @author 机智的小鱼君 <dragon-fish@qq.com>
 * @desc Provide a front-end structured discussion page with JavaScript.
 *       Similar to Community Feed and support wikitext.
 *
 * @license MIT
 * @url https://github.com/Fandom-zh/Gadget-WikiForum
 */
`

const BannerPlugin = new webpack.BannerPlugin({
  entryOnly: true,
  raw: true,
  banner: bannerText,
})

// Get files
const entry = {}
entry['core'] = './src/index.js'
readdirSync(path.resolve(__dirname, 'src', 'theme'))
  .filter((i) => i.endsWith('.js'))
  .map((i) => {
    const name = i.replace('.js', '')
    entry[`theme/${name}`] = `./src/theme/${i}`
  })
readdirSync(path.resolve(__dirname, 'src', 'loader'))
  .filter((i) => i.endsWith('.js'))
  .map((i) => {
    const name = i.replace('.js', '')
    entry[`loader/${name}`] = `./src/loader/${i}`
  })

// Exports
module.exports = {
  entry,
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
        use: [
          {
            loader: 'babel-loader',
          },
        ],
        exclude: '/node_modules/',
      },
      {
        test: /\.styl$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'stylus-loader',
          },
        ],
      },
    ],
  },
  resolve: {},
  devtool: 'source-map',
  plugins: [BannerPlugin],
  optimization: {
    minimize: isMinify ? true : false,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // compress: {
          //   drop_console: true,
          // },
        },
      }),
    ],
  },
}
