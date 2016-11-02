const isEqualsOverArray = (complexFieldValue, value, equalFunc) => {
	if (complexFieldValue instanceof Array){
		let found = false;
		for (var i in complexFieldValue) {
			if (equalFunc(complexFieldValue[i], value)) {
				found = true;
				break;
			}
		}
		return found;
	}
	return equalFunc(complexFieldValue, value);
}
const _eq = isEqualsOverArray;
//
//remember that 
//	1. complexFieldValue is always array
//	2. value is always string
//
const operator = {
  //for filter [atrt=value]
  "=" : function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{return a==b;});
  },
  //for filter [atrt*=value]
  "*=": function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{return (typeof a === 'string' && a.indexOf(b) != -1)});
  },
  //for filter [atrt^=value]  
  "^=": function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{return (typeof a === 'string' && a.startsWith(b))});
  },
  //for filter [atrt$=value]  
  "$=": function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{return (typeof a === 'string' && a.endsWith(b))});
  }, 
  //for filter [attr~=value]  
  "~=": function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{
		if (typeof a === 'string') {
			let a_splited = a.split(' ');
			return a_splited.indexOf(b) != -1;
		}
	});
  }, 
  //for filter [attr|=value]
  "|=": function(complexFieldValue, value){
	return _eq(complexFieldValue, value, (a,b)=>{
		if (typeof a === 'string') {
			let a_splited = a.split('-');
			return (a_splited[0] == value);
		}
	});
  },
  //for filter [attr]
  undefined: function(complexFieldValue, value){
	return complexFieldValue.length > 0;
  }
}

module.exports = { operator, isEqualsOverArray };
