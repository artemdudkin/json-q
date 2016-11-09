const { operator } = require('./filter_operators');

//returns {left:<left_side>, right:<right_side>, delimiter:<delimiter>}
//for instance, "a\\=b=c" becomes {left:'a=b', right:'c', delimiter:'='}
const parse_filter = (str, opt) => {
	if (typeof str === 'undefined') str='';
	if (typeof str !== 'string') str=str+'';
	let ret = {left:''};
	
	for (let i=0; i < str.length; i++) {
		let op = _is_operator(str, i, opt);
		if (op) {
			ret.delimiter = op;
			ret.right = str.substring(i + 1);
			ret.left = str.substring(0, i-op.length+1);
			break;
		}
	}
	if (!ret.right) ret.left = str;

	ret.left = _replace_escaped_operators(ret.left, opt);
	if (ret.right) ret.right = _replace_escaped_operators(ret.right, opt);

	return ret;
}

const _replace_escaped_operators = (str, opt) => {
	let ret = str.trim();
	const operator_keys = _get_operator_keys(opt);
	operator_keys.forEach(_itm => {
		ret = ret.replace("\\"+_itm, _itm);
	})
	return ret;
}

const _is_operator = (str, str_index, opt) => {
	let ret;
	const operator_keys = _get_operator_keys(opt);
	for (let i=0; i<operator_keys.length && !ret; i++){
		let op = _is_operator_word(str, str_index, operator_keys[i]);
		if (op) ret = operator_keys[i];
	}
	return ret;
}

const _get_operator_keys = (opt) => {
	const localOperator = Object.assign({}, operator, (opt || {}).operator);
	const operator_keys = Object.keys(localOperator);
	operator_keys.sort((a,b)=>{return b.length - a.length}); // if "=" comes before "*=" then "=" will win while it is really "*=", not "="
	return operator_keys;
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

module.exports = { parse_filter }
