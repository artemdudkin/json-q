const Errors = {
    FILTER_OPEN_FAIL           : '[ inside filter',
    FILTER_CLOSE_FAIL          : '] outside filter',
    CHARS_AFTER_TRANSFORMATION : 'something strange after filter',
    DOT_WITHOUT_LEVEL_NAME     : 'dot without level name'
}

const NONE   = 'none';
const FILTER = 'filter';
const PSEUDO = 'pseudo';

function State(){
	this.parsed = [];
	this.op_set_init_values();
}
State.prototype.getParsed = function(){
	return this.parsed;
}
State.prototype.filter_start = function(ch){
	switch (this.state) {
		case FILTER: 
			throw new Error(Errors.FILTER_OPEN_FAIL); 
		case PSEUDO: 
			this.op_pseudo_char(ch); 
			break;
		default:
			this.state = FILTER;
			this.op_filter_new();
	}
}
State.prototype.filter_end = function(ch){
	switch (this.state) {
		case FILTER: 
			this.state = NONE;
			break;
		case PSEUDO: 
			this.op_pseudo_char(ch);
			break;
		default:
			throw new Error(Errors.FILTER_CLOSE_FAIL);
	}
}
State.prototype.dot = function(ch){
	switch (this.state) {
		case FILTER: 
			this.op_filter_char(ch);
			break;
		case PSEUDO: 
			this.op_new_level(ch);
			break;
		default:
			this.op_new_level(ch);
	}
}
State.prototype.space = function(ch){
	switch (this.state) {
		case FILTER: 
			this.op_filter_char(ch);
			break;
		case PSEUDO: 
			this.op_new_level(ch);
			break;
		default:
			this.op_new_level(ch);
	}
}
State.prototype.pseudo_start = function(ch){
	switch (this.state) {
		case FILTER: 
			this.op_filter_char(ch);
			break;
		case PSEUDO: 
			this.op_pseudo_new(ch);
			break;
		default:
			this.state = PSEUDO;
			this.op_pseudo_new(ch);
	}
}
State.prototype.default = function(ch){
	switch (this.state) {
		case FILTER: 
			this.op_filter_char(ch);
			break;
		case PSEUDO: 
			this.op_pseudo_char(ch);
			break;
		default:
			if (this.transformation.length > 0) throw new Error(Errors.CHARS_AFTER_TRANSFORMATION);
			this.op_expr_char(ch);
	}
}


State.prototype.op_set_init_values = function(){
	this.state = NONE;
	this.expr = '';
	this.next = false;
	this.transformation = [];
}
State.prototype.op_filter_new = function(ch){
	this.transformation.push({filter:''});
}
State.prototype.op_filter_char = function(ch){
	const obj = this.transformation[this.transformation.length-1];
	obj.filter += ch;
}
State.prototype.op_pseudo_new = function(ch){
	this.transformation.push({pseudo:''});
}
State.prototype.op_pseudo_char = function(ch){
	const obj = this.transformation[this.transformation.length-1];
	obj.pseudo += ch;
}
State.prototype.op_expr_char = function(ch){
	this.expr += ch;
}
State.prototype.op_new_level = function(ch){
	if ( (this.expr && this.expr!='') || this.transformation.length > 0) {
		let o = {};
		o[this.next ? 'next' : 'any'] = this.expr ? this.expr : '*';
		if (this.transformation.length > 0) {
			o.transformation = this.transformation.map(_itm => {
				if (_itm.filter) _itm.filter = _itm.filter.trim();
				if (_itm.pseudo) _itm.pseudo = _itm.pseudo.trim();
				return _itm;
			})
		}
		this.parsed.push(o);
	} else {
		if (this.next) {
			throw new Error(Errors.DOT_WITHOUT_LEVEL_NAME);
		} else {
			//do nothing - multiple spaces
		}
	}
	this.op_set_init_values();
	this.next = (ch === '.');
}
State.prototype.op_finalize = function(){
	if ( (this.expr && this.expr!='') || this.transformation.length > 0) {
		this.op_new_level();
	}
}





//returns array of {<type>:<string>, [filter=<string>]} where <type>=next|any (and 'filter' field is not mandandatory)
//for instance, "a.b"       becomes [{any:'a'}, {next:'b'}]
//              ".a[x=1] b" becomes [{next:'a', filter:'x=1'}, {any:'b'}]
const parse = (str) => {
	let state = new State();

	if (typeof str != 'string') str=str+'';	
	for (let i in str) {
		if ((i==0 || str[i-1] != '\\') && str[i] === '[') {
			state.filter_start(str[i]);
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === ']') {
			state.filter_end(str[i]);
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === '.') {
			state.dot(str[i]);
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === ' ') {
			state.space(str[i]);
		} else 
		if ((i==0 || str[i-1] != '\\') && str[i] === ':') {
			state.pseudo_start(str[i]);
		} else {
			state.default(str[i]);
		}
	}
	state.op_finalize();

	return state.getParsed();
}

module.exports = { parse, Errors }
