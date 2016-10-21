//TODO dedup _find_field and _deep_find_field
//TODO fix difference between wsdl parsed by json-q and by old parser
//TODO combination of filters: x[y=1][z=2] combined by AND logical operand
//TODO add [attr] [attr=value] [attr~=value] [attr|=value] [attr^=value] [attr$=value] [attr*=value] in addition to [attr=value]
//TODO? should i add [x>25] and custom filter function?
//TODO? should i add pseudo-classes like :nth-child :only-child :empty etc.?

const {parse, parse_filter} = require('./parser');

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
		ret = obj;
		while (flow[0]) {
			if (flow[0].any) {
				ret = _deep_find_field(ret, flow[0].any);
			} else 
			if (flow[0].next) {
				ret = _find_field(ret, flow[0].next);
			} else {
				ret = []
			}
			if (flow[0].filter) {
				let filtered_ret = []
				ret.forEach(_itm => {
					let o = _obj_filter(_itm, flow[0].filter);
					if (o) filtered_ret = filtered_ret.concat(o);
				})
				ret = filtered_ret;
			}
			flow.splice(0, 1);
		}
	}
	return _dedup(ret); //dedup as "a b c" at {a:{b:{b:{c:{z:1}}}}} can return [{z:1}, {z:1}]
}

const _obj_filter = (obj, filter) => {
	if (!_obj_satisfies_filter(obj, filter)) {
		return;
	} else {
		return _deep_filter(obj, (_itm, parent, parent_key) => {
			if (_itm instanceof Array) {
				let filtered = [];
				if (!parent) {
					for (let i=0; i<_itm.length; i++) {
						if (_obj_satisfies_filter(_itm[i], filter)) filtered.push(_itm[i]);
					}
				} else {
					//by the way, parent[parent_key] == _itm, _itm is array
					let saved = parent[parent_key];
					for (let i=0; i<saved.length; i++) {
						parent[parent_key] = [saved[i]];
						if (_obj_satisfies_filter(obj, filter)) filtered.push(saved[i]);
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
//(filter can be obky like "a.b.c=d", that means obj.a.b.c = d)
//(if obj.a.b.c returns array (look at _get) then it returns true if it contains filter value)
const _obj_satisfies_filter = (obj, filter) => {

	const f = parse_filter(filter);
	const complexField = f.left;
        const value = f.right;
	
	let complexFieldValue = get(obj, complexField);

	if (complexFieldValue instanceof Array){
		let found = false;
		for (var i in complexFieldValue) {
			if (complexFieldValue[i] == value) {
				found = true;
				break;
			}
		}
		return found;
	}
	return (complexFieldValue == value);
}

const _find_field = (obj, fieldName, p) => {
	let ret = [];
	if (obj) {
		if (obj instanceof Array) {
			obj.forEach(_itm => {
				ret = ret.concat(_find_field(_itm, fieldName, p?p:''+' '));
			})
		} else {
			if (fieldName==='*') {
				if (typeof obj == 'object') {
					ret.push(obj);
					for (let i in obj) ret.push(obj[i]);
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
			}
		}
	}
	return ret;
}

const _deep_find_field = (obj, fieldName, p) => {
	let ret = [];
	if (obj) {
		if (obj instanceof Array) {
			obj.forEach(_itm => {
				ret = ret.concat(_deep_find_field(_itm, fieldName, p?p:''+' '));
			})
		} else {
			if (fieldName==='*') {
				if (typeof obj == 'object') {
					ret.push(obj);
					for (let i in obj) {
						ret.push(obj[i]);
						ret = ret.concat(_deep_find_field(obj[i], fieldName, p?p:''+' '));
					}
				} else {
					ret.push(obj);
				}
			} else {
				if (obj[fieldName])  {
					if (obj[fieldName] instanceof Array) {
						ret = ret.concat(obj[fieldName]);
					} else {
						ret.push(obj[fieldName]);
					}
				}
				if (typeof obj == 'object') {
					for (let i in obj) ret = ret.concat(_deep_find_field(obj[i], fieldName, p?p:''+' '));
				}
			}
		}
	}
	return ret;
}

module.exports = {get};
