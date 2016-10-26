
//object to store multiple filters (chenging only last one)
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

module.exports = { parse }
