const { operator } = require('./parser_operators');
const operator_keys = Object.keys(operator);
operator_keys.sort((a,b)=>{return b.length - a.length});


function Filter(){
	this.value= [];
	this.active = undefined;
}
Filter.prototype.newFilter = function(){
	if (this.isActive()) throw new Error("[ inside filter");
	this.active = this.value.length;
	this.value[this.active] = "";
}
Filter.prototype.addChar = function(ch){
	if (!this.isActive()) throw new Error("filter was not started by [");
	this.value[this.active] = this.value[this.active] + ch;
}
Filter.prototype.closeFilter = function(){
	if (!this.isActive()) throw new Error("] outside filter");
	this.active = undefined;
}
Filter.prototype.length = function() {
	return this.value.length;
}
Filter.prototype.isActive = function() {
	return (typeof this.active!= 'undefined' );
}
Filter.prototype.getValue = function() {
	let ret = [];
	//trim'em'all
	for (let i=0; i<this.value.length; i++) ret.push(this.value[i].trim());
	return ret;
}


const _add = ( arr, state) => {
	let o = {};
	o[state.next ? 'next' : 'any'] = state.expr ? state.expr : '*';
	if (state.filter.length() > 0) o.filter = state.filter.getValue();
	arr.push(o);
	state.filter = new Filter();
	state.expr = '';
	state.next = false;
}

//returns array of {<type>:<string>, [filter=<string>]} where <type>=next|any (and 'filter' field is not mandandatory)
//for instance, "a.b"       becomes [{any:'a'}, {next:'b'}]
//              ".a[x=1] b" becomes [{next:'a', filter:'x=1'}, {any:'b'}]
const parse = (str) => {
	if (typeof str != 'string') str=str+'';
	let ret = [];
	
	let state = {filter:new Filter(), expr:'', next:false};
	for (let i in str) {
		if ((i==0 || str[i-1] != '\\') && str[i] === '[') {
			state.filter.newFilter();
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === ']') {
			state.filter.closeFilter();
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === '.') {
			if (state.filter.isActive()) {
				state.filter.addChar(str[i]);
			} else if (state.expr || state.filter.length() > 0) {
				_add(ret, state);
				state.next = true;
			} else {
				//start of the line or some error (double dot etc.)
				if (ret.length==0) {
					state.next = true;
				} else {
					throw new Error('parse error: nothing before dot');
				}
			}
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === ' ') {
			if (state.filter.isActive()) {
				state.filter.addChar(str[i]);
			} else if (state.expr || state.filter.length() > 0) {
				_add(ret, state);
			} else {
				//do nothing - it's just double space
			}
		} else {
			if (state.filter.length() > 0) {
				state.filter.addChar(str[i]);
			} else {
				state.expr = state.expr + str[i];
			}
		}
	}
	if (state.expr || state.filter.length() > 0) {
		_add(ret, state);
	}
	return ret;
}

//returns {left:<left_side>, right:<right_side>, delimiter:<delimiter>}
//for instance, "a\\=b=c" becomes {left:'a=b', right:'c', delimiter:'='}
const parse_filter = (str) => {
	if (typeof str != 'string') str=str+'';
	let ret = {left:''};
	
	for (let i=0; i < str.length; i++) {
		let op = _is_operator(str, i);
		if (op) {
			ret.delimiter = op;
			ret.right = str.substring(i + 1);
			ret.left = str.substring(0, i-op.length+1);
			break;
		}
	}
	if (!ret.right) ret.left = str;

	ret.left = _replace_escaped_operators(ret.left);
	if (ret.right) ret.right = _replace_escaped_operators(ret.right);

	return ret;
}

const _replace_escaped_operators = (str) => {
	let ret = str.trim();
	operator_keys.forEach(_itm => {
		ret = ret.replace("\\"+_itm, _itm);
	})
	return ret;
}

const _is_operator = (str, str_index) => {
	let ret;
	for (let i=0; i<operator_keys.length && !ret; i++){
		let op = _is_operator_word(str, str_index, operator_keys[i]);
		if (op) ret = operator_keys[i];
	}
	return ret;
}

const _is_operator_word = (str, str_index, word) => {
	let ret = false;
	if (str_index>=word.length-1) {
		let word_index = 0;
		while (word_index<word.length-1 && str[str_index-word_index] == word[word.length-1-word_index]) word_index++;
		if (word_index == word.length-1 && str[str_index-word_index] == word[word.length-1-word_index]) {
			if (str_index==word.length-1) {
				ret = true;
			} else {
				if (str[str_index-1] != '\\' ) {
					ret = true;
				}
			}
		}
	}
	return ret;
}

module.exports = {parse, parse_filter};
