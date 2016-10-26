//TODO fix difference between wsdl parsed by json-q and by old parser
//TODO make it works with browsers (IE9+)
//TODO  JSON.parse(JSON.stringify(ret)) is not good for Dates
//TODO? should i add pseudo-classes like :empty :only-child :first-child :last-child :nth-child(n) :nth-last-child(n) :not(selector) ?
//TODO? should i add [x>25] and custom filter function?

const { parse, parse_filter } = require('./parser');
const { operator } = require('./filter_operators');

const _dedup = x => {return (x instanceof Array ? x.filter((v, i, a) => a.indexOf(v) === i) : x)} //dedup array

const _deep_filter = (obj, before, after, parent, parent_key) => {
	let ret = obj;
	if (typeof obj == 'object') {
		if (before) ret = before(ret, parent, parent_key);
		for(let i in ret) {
			ret[i] = _deep_filter(obj[i], before, after, ret, i);
		}
		if (after) ret = after(ret, parent, parent_key);
	}
	return ret;
}

const get = (obj, path) => {
	return _get(obj, parse(path));
}

const _get = (obj, flow) => {
	flow = Object.assign([], flow);
	let ret = [];
	if (obj instanceof Array) {
		obj.forEach(_itm => {
			ret = ret.concat(_get(_itm, flow));
		})
	} else {
		ret = [obj];
		while (flow[0]) {
			if (flow[0].any) {
				ret = _find_field(ret, flow[0].any, true); //deep find_field
			} else 
			if (flow[0].next) {
				ret = _find_field(ret, flow[0].next);
			} else {
				ret = []
			}
			if (flow[0].filter) {
				flow[0].filter.forEach(_filter => {
					let filtered_ret = []
					ret.forEach(_itm => {
						let o = _obj_filter(_itm, _filter);
						if (o) filtered_ret = filtered_ret.concat(o);
					})
					ret = filtered_ret;					
				})
			}
			flow.splice(0, 1);
		}
	}
	ret = _dedup(ret); //dedup as "a b c" at {a:{b:{b:{c:{z:1}}}}} can return [{z:1}, {z:1}]

	//remove links to original object
	ret  = JSON.parse(JSON.stringify(ret));
	return ret;
}

const _have_some_filters = (flow) => {
	let ret = false;
	if (flow.filter) {
		for ( let i=0; i<flow.filter.length && !ret; i++){
			let filterParsed = parse_filter(flow.filter[i]);
			if (filterParsed.left) ret = true;
		}
	}
console.log('_have_some_filters => ', ret);
	return ret;
}

//remove items of multiple values (i.e. from arrays) that does not satisfies filter (at any level of nested of object)
const _obj_filter = (obj, filter) => {
	const filterParsed = parse_filter(filter);

	if (!filterParsed.left) 
		return obj;

	if (!_obj_satisfies_filter(obj, filterParsed)) {
		return;
	} else {
		return _deep_filter(obj, (_itm, parent, parent_key) => {
			if (_itm instanceof Array) {
				let filtered = [];
				if (!parent) {
					for (let i=0; i<_itm.length; i++) {
						if (_obj_satisfies_filter(_itm[i], filterParsed)) filtered.push(_itm[i]);
					}
				} else {
					//by the way, parent[parent_key] == _itm, _itm is array
					let saved = parent[parent_key];
					for (let i=0; i<saved.length; i++) {
						parent[parent_key] = [saved[i]];
						if (_obj_satisfies_filter(obj, filterParsed)) filtered.push(saved[i]);
					}
					parent[parent_key] = saved;
				}
				_itm = filtered;
			}
			return _itm;
		});
	}
}

//is 'obj' satisfies 'filter' condition
//(filter can be like this "a.b.c=d", that means obj.a.b.c = d)
//(if obj.a.b.c returns array (look at _get) then it returns true if it contains filter value)
const _obj_satisfies_filter = (obj, filterParsed) => {

	const complexField = filterParsed.left;
        const value = filterParsed.right;
        const equal = operator[filterParsed.delimiter] || function(){};
	
	let complexFieldValue = get(obj, complexField);

        return equal(complexFieldValue, value);
}

const _find_field = (obj, fieldName, deep) => {
	let ret = [];
	if (obj) {
		if (obj instanceof Array) {
			obj.forEach(_itm => {
				ret = ret.concat(_find_field(_itm, fieldName, deep));
			})
		} else {
			if (fieldName==='*') {
				if (typeof obj == 'object') {
					ret.push(obj);
					for (let i in obj) {
						ret.push(obj[i]);
						if (deep) ret = ret.concat(_find_field(obj[i], fieldName, true));
					}
				} else {
					ret.push(obj);
				}
			} else {
				if (obj[fieldName]) {
					if (obj[fieldName] instanceof Array) {
						ret = ret.concat(obj[fieldName]);
					} else {
						ret.push(obj[fieldName]);
					}
				}
				if (deep && typeof obj == 'object') {
					for (let i in obj) 
						ret = ret.concat(_find_field(obj[i], fieldName, true));
				}
			}
		}
	}
	return ret;
}

module.exports = {get};
