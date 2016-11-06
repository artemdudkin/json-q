//FIX _replace_escaped_operators? WTF?
//FIX fix difference between wsdl parsed by json-q and by old parser

//TODO fix readme to show deep filters at example
//TODO fix tests to make 100% coverage
//TODO make it works with browsers (IE9+)
//TODO add strings?
//TODO performance?

const clone = require('clone');
const { dedup, deep_filter, flatten } = require('./helper');
const { parse } = require('./parse');
const { parse_filter } = require('./parse_filter');
const { operator } = require('./filter_operators');
const { pseudo } = require('./filter_pseudos');


const get = (obj, path, opt) => {
	const ret = _get(clone(obj), parse(path), opt);
	return ret;
}

const _get = (obj, flow, opt) => {
	flow = Object.assign([], flow);
	let ret = [];
	if (obj instanceof Array) {
		obj.forEach(_itm => {
			ret = ret.concat(_get(_itm, flow, opt));
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
			if (flow[0].transformation) {
				flow[0].transformation.forEach(_transformation => {
					let filtered_ret = ret;
					if (_transformation.filter) {
						filtered_ret = []
						ret.forEach(_itm => {
							let o = _obj_filter(_itm, _transformation.filter, opt);
							if (o) filtered_ret = filtered_ret.concat(o);
						})
					}
					if (_transformation.pseudo) {
						filtered_ret = _obj_pseudo(ret, _transformation.pseudo, opt);
					}
					ret = filtered_ret;
				})
			}
			flow.splice(0, 1);
		}
	}

	ret = dedup(ret); //dedup as "a b c" at {a:{b:{b:{c:{z:1}}}}} can return [{z:1}, {z:1}]
	return ret;
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
					if (deep) ret.push(obj); // ".*" does not include current level (while " *" does)
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
						ret = ret.concat(flatten(obj[fieldName]));
					} else {
						ret.push(flatten(obj[fieldName]));
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

const _obj_pseudo = (obj, pseudoName, opt) => {
	let localPseudo = Object.assign({}, pseudo, (opt || {}).pseudo);

	const func = localPseudo[pseudoName] || function(){return obj};
	return func(obj);
}

//remove items of multiple values (i.e. from arrays) that does not satisfies filter (at any level of nested of object)
const _obj_filter = (obj, filter, opt) => {
	const filterParsed = parse_filter(filter, opt);

	if (!filterParsed.left) {
		return obj;
	}

	if (!_obj_satisfies_filter(obj, filterParsed, opt)) {
		return;
	} else {
		return deep_filter(obj, (_itm, parent, parent_key) => {
			if (_itm instanceof Array) {
				let filtered = [];
				if (!parent) {
					for (let i=0; i<_itm.length; i++) {
						if (_obj_satisfies_filter(_itm[i], filterParsed, opt)) filtered.push(_itm[i]);
					}
				} else {
					//by the way, parent[parent_key] == _itm, _itm is array
					let saved = parent[parent_key];
					
					const parent_backup = (parent instanceof Array ? [] : {});
					const parent_keys = Object.keys(parent);
					for (let j in parent) {
						parent_backup[j] = parent[j];
						parent[j] = undefined;
					}
					
					for (let i=0; i<saved.length; i++) {
						parent[parent_key] = [saved[i]];
						if (_obj_satisfies_filter(obj, filterParsed, opt)) {
							filtered.push(saved[i]);
						}
					}
					
					for (let j in parent_backup) {
						parent[j] = parent_backup[j];
					}
					parent[parent_key] = filtered;
				}
				_itm = filtered;
			}
			return _itm
		});
	}
}

//is 'obj' satisfies 'filter' condition
//(filter can be like this "a.b.c=d", that means obj.a.b.c = d)
//(if obj.a.b.c returns array (look at _get) then it returns true if it contains filter value)
const _obj_satisfies_filter = (obj, filterParsed, opt) => {
	let localOperator = Object.assign({}, operator, (opt || {}).operator);

	const complexField = filterParsed.left;
	const value = filterParsed.right;
	const equal = localOperator[filterParsed.delimiter] || function(){};

	let complexFieldValue = _get(obj, parse(complexField), opt);
	
	return equal(complexFieldValue, value);
}

module.exports = { get };
