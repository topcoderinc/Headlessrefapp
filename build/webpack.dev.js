const webpack = require('webpack');
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin;
const StringReplacePlugin = require("string-replace-webpack-plugin");

const root = require('./helpers').root;
const VERSION = JSON.stringify(require('../package.json').version);
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const webpackMerge = require('webpack-merge'); // used to merge webpack configs
const commonConfig = require('./webpack.common.js');

module.exports = webpackMerge(commonConfig({
  IS_PRODUCTION: IS_PRODUCTION,
  AOT: IS_PRODUCTION
}), {
  devtool: '#inline-source-map',
  entry: {
    'polyfills': './lib/polyfills.ts',
    'redoc': './lib/index.ts',
  },
  devServer: {
    contentBase: root('demo'),
    watchContentBase: true,
    compress: true,
    watchOptions: {
      poll: true
    },
    host:'127.0.0.1',
    port: 9000,
    hot: false,
    stats: 'errors-only'
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'awesome-typescript-loader',
          'angular2-template-loader',
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: ['vendor', 'polyfills'],
      minChunks: Infinity
    })
  ]
})
