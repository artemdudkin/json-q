var webpack = require("webpack");
var path = require("path");
var fs = require("fs");
var WebpackOnBuildPlugin = require('on-build-webpack');
var WebpackBeforeBuildPlugin = require('before-build-webpack');

var rmDir = function(f) {
	if (fs.existsSync(f)) {
		var files = fs.readdirSync(f);
		files && files.forEach(file => {
			fs.unlinkSync(path.join(f, file));
		})
		fs.rmdirSync(f);
	}
}







module.exports = {
  context: __dirname,
  entry: "./lib/index.js",
  output: {
    path: path.resolve(__dirname, '../'),
    filename: "index.min.js",
    library: "jsonQ"
  },

  plugins: [
        new WebpackBeforeBuildPlugin(function(compiler, cb) {
//		//remove index.min.js
		var file = path.resolve(__dirname, '../index.min.js')
		if (fs.existsSync(file)) fs.unlinkSync(file);

//		//remove lib dir
		var to = path.join(__dirname, 'lib');
		rmDir(to);
		try{ fs.mkdirSync(to) } catch(e) { if ( e.code != 'EEXIST' ) throw e; }

//		//copy files from ../lib
		var from = path.resolve(__dirname, '../lib');
		var files = fs.readdirSync(from);
	      	files && files.forEach(file => {
			fs.createReadStream(path.join(from, file)).pipe(fs.createWriteStream(path.join(to, file)));
		})
		cb();
	}),
	new WebpackOnBuildPlugin(function(stats) {
		rmDir( path.join(__dirname, 'lib') );
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
		presets: ['es2015-loose']
	}
    }]
  }

};

