var webpack = require("webpack");
var path = require("path");
var WebpackOnBuildPlugin = require('on-build-webpack');
var WebpackBeforeBuildPlugin = require('before-build-webpack');
var { del_folder, make_folder, del_file, copy_files } = require('./build_helper');


module.exports = {
  context: __dirname,
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, '../'),
    filename: "index.min.js",
    library: "jsonQ"
  },
  externals:[ function(context, request, callback) {
	// do not include node.js Buffer lib (which means adding 23k minified lib)
        // clone() uses it, but can work without it
	if(/buffer/.test(request)) {
                return callback(null, "{}");
	}
	callback();
  }],

  plugins: [
        new WebpackBeforeBuildPlugin(function(compiler, cb) {
		del_file( path.resolve(__dirname, '../index.min.js') );

		var from = path.resolve(__dirname, '../lib');
		var to = path.join(__dirname, 'lib');

		del_folder(to);
		make_folder(to);
		copy_files(from, to, cb);
		
//		cb();
	}),
	new WebpackOnBuildPlugin(function(stats) {
		del_folder( path.join(__dirname, 'lib') );
	}),

	new webpack.optimize.UglifyJsPlugin({minimize: true}),
  ],
  
  module: {
    loaders: [{
	test: /\.js?$/,
	loader: "babel",
	include: [
		path.join(__dirname, "./lib"),
	],
	query: {
                plugins: ["transform-object-assign"],
		presets: ['es2015']
	}
    }]
  }

};

