'use strict';

const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');

module.exports = {
  entry: {
    app: './index.tsx'
  },
  output: {
    filename: '[name].[contenthash].js',
    chunkFilename: '[name].[contenthash].js'
  },
  resolve: {
    modules: [
      path.resolve(process.cwd(), 'node_modules'),
      path.resolve(process.cwd(), '../node_modules'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ],
            plugins: [
              '@babel/plugin-transform-runtime',
              '@babel/plugin-transform-modules-commonjs',
              '@babel/plugin-proposal-object-rest-spread',
              '@babel/plugin-proposal-class-properties',
            ]
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use: {
          loader: 'file-loader',

          options: {
            name: '[name][hash].[ext]',
            outputPath: 'fonts/'
          }
        }
      },
      {
        test: /\.(less|css)$/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader'
          }
        ]
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css'
    }),
    new HtmlWebpackPlugin({
      template: './index.html'
    })
  ],
  optimization: {
    splitChunks: {
      // whether for async imported files
      chunks: 'all',
      cacheGroups: {
        // third party codes
        vendor: {
          name: 'vendor',
          // larger number means higher priority
          priority: 1,
          test: /node_modules/,
          minSize: 0,
          minChunks: 1
        },
        // common codes
        common: {
          name: 'common',
          priority: 0,
          minSize: 0,
          // at least used 2 times
          minChunks: 2
        }
      }
    }
  },
  devServer: {
    contentBase: './dist', // 本地服务器所加载的页面所在的目录
    historyApiFallback: true, // 不跳转
    inline: true, // 实时刷新
    index: 'index.html',
    port: 8080,
    open: true,
  }
};