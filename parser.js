const _add = ( arr, state) => {
	let o = {};
	o[state.next ? 'next' : 'any'] = state.expr ? state.expr : '*';
	if (state.filter_expr) o.filter = state.filter_expr.trim();
	arr.push(o);
	state.filter_expr = '';
	state.expr = '';
	state.next = false;
}

//returns array of {<type>:<string>, [filter=<string>]} where <type>=next|any (and 'filter' field is not mandandatory)
//for instance, "a.b"       becomes [{any:'a'}, {next:'b'}]
//              ".a[x=1] b" becomes [{next:'a', filter:'x=1'}, {any:'b'}]
const parse = (str) => {
	if (typeof str != 'string') str=str+'';
	let ret = [];
	
	let state = {filter_expr:'', expr:'', next:false};
	for (let i in str) {
		if (str[i] === '[') {
			if (state.filter_expr) throw new Error('[ inside filter');
			state.filter_expr = str[i];
		} else 
		if (str[i] === ']') {
			if (!state.filter_expr) throw new Error('] outside filter');
			state.filter_expr = state.filter_expr.substring(1); //delete first "["
			_add(ret, state);
		} else 
		if (str[i] === '.') {
			if (state.filter_expr) {
				state.filter_expr = state.filter_expr + str[i]
			} else {
				if (state.expr) _add(ret, state);
				state.next = true;
			}
		} else 
		if (str[i] === ' ') {
			if (state.filter_expr) {
				state.filter_expr = state.filter_expr + str[i]
			} else if (state.expr) {
				_add(ret, state);
			}
		} else {
			if (state.filter_expr) {
				state.filter_expr = state.filter_expr + str[i];
			} else {
				state.expr = state.expr + str[i];
			}
		}
	}
	if (state.expr || state.filter_expr) {
		_add(ret, state);
	}
	return ret;
}

//returns {left:<left_side>, right:<right_side>, delimiter:<delimiter>}
//for instance, "a\\=b=c" becomes {left:'a=b', right:'c'}
const parse_filter = (str) => {
	if (typeof str != 'string') str=str+'';
	let ret = {left:''};
	
	for (let i=0; i < str.length; i++) {
		if (str[i] == '=' && (i==0 || str[i-1] != '\\' )) {
			ret.delimiter = "=";
			ret.right = str.substring(i+1).trim();
			break;
		} else {
			ret.left = ret.left + str[i];
		}
	}
	ret.left = ret.left.replace("\\=", "=").trim();
	if (ret.right) ret.right = ret.right.replace("\\=", "=");
	return ret;
}



module.exports = {parse, parse_filter};