//
//remember that 
//	value is always not-array (may be object)
//
const pseudo = {

	"empty" : function(value){
		if (typeof value !== 'object') return value;
	}

}

module.exports = { pseudo };
