var fs = require("fs");
var path = require("path");

const del_folder = function(f){
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

const make_folder = function(f){
	try{ fs.mkdirSync(f) } catch(e) { if ( e.code != 'EEXIST' ) throw e; }
}

const copy_files = function(fromFolder, toFolder){
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
}

const del_file = function(file){
	if (fs.existsSync(file)) fs.unlinkSync(file);
}


module.exports = { del_folder, make_folder, del_file, copy_files }
