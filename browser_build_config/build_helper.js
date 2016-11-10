var fs = require("fs");
var path = require("path");

const del_folder = function(f){
	if (fs.existsSync(f)) {
		var files = fs.readdirSync(f);
		files && files.forEach(file => {
			fs.unlinkSync(path.join(f, file));
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
		fs.createReadStream(path.join(fromFolder, file)).pipe(fs.createWriteStream(path.join(toFolder, file)));
	})
}

const del_file = function(file){
	if (fs.existsSync(file)) fs.unlinkSync(file);
}


module.exports = { del_folder, make_folder, del_file, copy_files }
