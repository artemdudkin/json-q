var fs = require("fs");
var path = require("path");
var extra_fs = require("fs.extra");

const del_folder = function(f){
	if (fs.existsSync(f)) {
		extra_fs.rmrfSync(f);
	}
}

const make_folder = function(f){
	try{ fs.mkdirSync(f) } catch(e) { if ( e.code != 'EEXIST' ) throw e; }
}

const copy_files = function(fromFolder, toFolder, cb){
	extra_fs.copyRecursive(fromFolder, toFolder, function (err) {
		if (err) {
			throw err;
		}
		if (cb) cb();
	});
}

const del_file = function(file){
	if (fs.existsSync(file)) fs.unlinkSync(file);
}


module.exports = { del_folder, make_folder, del_file, copy_files }








const del_folder_old = function(f){
	if (fs.existsSync(f)) {
		var files = fs.readdirSync(f);
		files && files.forEach(file => {
//			let n = path.join(f, file)
			let n = f + '/' + file;
			let stats = fs.statSync(n);
			if (stats.isFile()) {
				fs.unlinkSync(n);
			} else if (stats.isDirectory()) {
				del_folder(n);
			} else {
				//what is it, man? uhh.
			}
		})
		fs.rmdirSync(f);
	}
}

const copy_files_old = function(fromFolder, toFolder, cb){
	var files = fs.readdirSync(fromFolder);
      	files && files.forEach(file => {
//		let from = path.join(fromFolder, file);
//		let to = path.join(toFolder, file);
		let from = fromFolder + '/' + file;
		let to = toFolder + '/' + file;
		let stats = fs.statSync(from);
		if (stats.isFile()) {
			fs.createReadStream(from).pipe(fs.createWriteStream(to));
		} else if (stats.isDirectory()) {
			make_folder(to);
			copy_files(from, to);
		} else {
			//what is it, man? uhh.
		}
	})
	if (cb) cb();
}
