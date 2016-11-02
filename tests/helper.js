const { assert } = require('chai');
const { flatten } = require('../helper');

describe('flatten', function(){
	it('"[[[[[1]]]]]" -> [1]',function(){
		assert.deepEqual(flatten([[[[[1]]]]]), [1]);
	});
	it('"[[[[[1]]], [[2, 3]]]]" -> [1, 2, 3]',function(){
		assert.deepEqual(flatten([[[[[1]]], [[2, 3]]]]), [1,2,3]);
	});
});
