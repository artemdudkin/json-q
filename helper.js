/////////////////////////////////////////////////
//
// Array functions
//
/////////////////////////////////////////////////

const dedup = x => {return (x instanceof Array ? x.filter((v, i, a) => a.indexOf(v) === i) : x)} //dedup array

const flatten = (obj) => {
	let ret = obj;
	if (obj instanceof Array) {
		ret = []
		obj.forEach(_itm => {
			ret = ret.concat(flatten(_itm)) 
		})
	}
	return ret;
}

const equals_if_one_of_it_equals = (complexFieldValue, value, equalFunc) => {
	if (complexFieldValue instanceof Array){
		let found = false;
		for (var i in complexFieldValue) {
			if (equalFunc(complexFieldValue[i], value)) {
				found = true;
				break;
			}
		}
		return found;
	}
	return equalFunc(complexFieldValue, value);
}

/////////////////////////////////////////////////
//
// Object functions
//
/////////////////////////////////////////////////


const deep_filter = (obj, before, after, parent, parent_key) => {
	let ret = obj;
	if (typeof obj == 'object') {
		if (before) ret = before(ret, parent, parent_key);
		if (ret instanceof Array) {
			ret = ret.filter((_itm, _index) => {
				return deep_filter(_itm, before, after, ret, _index);
			});
		} else {
			for(let i in ret) {
				ret[i] = deep_filter(ret[i], before, after, ret, i);
			}
		}
		if (after) ret = after(ret, parent, parent_key);
	}
	return ret;
}

const deep_iterate = (obj, before, after) => {
	if (typeof obj == 'object') {
		if (before) before(obj);
		for(var i in obj) {
			if (typeof obj[i] == 'object') deep_iterate(obj[i], before, after);
		}
		if (after) after(obj);
	}
}

const deep_sort = (obj, sort_func) => {
	if (obj instanceof Array) {
		obj.sort(sort_func);
	}

	if (typeof obj == 'object') {
		for(var i in obj)
			if (typeof obj[i] == 'object')
				deep_sort(obj[i], sort_func);
	}
}

module.exports = { dedup, flatten, equals_if_one_of_it_equals, deep_filter, deep_iterate, deep_sort };
