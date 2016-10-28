
const _filter = (complexFieldValue, filterFunc) => {
	let ret = [];
	if (complexFieldValue instanceof Array){
		let ret = [];
		return complexFieldValue.filter(_itm => {
			if (filterFunc(_itm)) ret.push(_itm);
		})
		return ret;
	}
	return filterFunc(complexFieldValue) ? complexFieldValue : undefined;
}

const pseudos = {

	"empty" : function(complexFieldValue){
		return _filter(complexFieldValue, (a)=>{
			return (typeof a !== 'object')
		});
	}

}

module.exports = { pseudos };
