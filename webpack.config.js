var webpack = require("webpack");
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var extractSass = new ExtractTextPlugin({
    filename: "index.css",
    allChunks: true
    // disable: process.env.NODE_ENV === "development"
});

module.exports = function(env){
  var plugins = [
    new HtmlWebpackPlugin({
        template: 'src/index.html'
    }),

    // Reference: http://webpack.github.io/docs/list-of-plugins.html#ignoreplugin
	  // Ignore some modules. Here, avoids loading all locales of Moment.js (rather big! reduces vendor file of 165 KB).
	  // We can then require specific ones. See also http://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    extractSass
  ];

  plugins.push(
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify(env)//'production' or 'development'
      }
    })
  );
  if(env === 'production'){
    plugins.push(
      new webpack.optimize.UglifyJsPlugin({
        beautify: false,
        mangle: {
          screw_ie8: true,
          keep_fnames: true
        },
        compress: {
          screw_ie8: true
        },
        comments: false
      })
    )
  }
  return {
    entry: './src/index.js',
    output: {
      filename: 'witch-hunt-client.js',
      path: path.resolve(__dirname, 'build')
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['env', 'react'],
              plugins: [
                'babel-plugin-transform-object-rest-spread',
                'babel-plugin-react-intl'
              ]
            }
          }
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {}  
            }
          ]
        },
        {
          test: /\.scss$/,
          use: extractSass.extract({
            use: [{
              loader: "css-loader"
            }, {
              loader: "sass-loader"
            }
            ],
            // use style-loader in development
            fallback: "style-loader"
          })
        }
      ],
      loaders: [
        {
          test: /\.html$/,
          loader: 'html-loader'
        }
      ]
    },
    plugins: plugins
  }
};