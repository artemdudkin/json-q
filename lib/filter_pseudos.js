//
//remember that 
//	1. arrValue is always array 
//	2. pseudo should return array
//
const pseudo = {

	"empty" : function(arrValue){
		return arrValue.filter(_itm => {
			return (typeof _itm !== 'object')
		})
	}

}

module.exports = { pseudo };
