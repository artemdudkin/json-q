const { assert } = require('chai');
const { dedup, flatten, true_if_one_is_true, deep_iterate, deep_sort, deep_filter } = require('../lib/helper');

describe('dedup', function(){
	it('1 -> 1',function(){
		assert.deepEqual(dedup(1), 1);
	});

	it('[1, 2, 2] -> [1, 2]',function(){
		assert.deepEqual(dedup([1, 2, 2]), [1, 2]);
	});

	it('[1, o, 1, o, 2] -> [1, o, 2]',function(){
		const o = {a:1}
		const x = [1, o, 2, o, 1]
		assert.deepEqual(dedup(x), [1, {a:1}, 2]);
	});

});

describe('flatten', function(){
	it('"[[[[[1]]]]]" -> [1]',function(){
		assert.deepEqual(flatten([[[[[1]]]]]), [1]);
	});
	it('"[[[[[1]]], [[2, 3]]]]" -> [1, 2, 3]',function(){
		assert.deepEqual(flatten([[[[[1]]], [[2, 3]]]]), [1,2,3]);
	});
});

describe('true_if_one_is_true', function(){
	const eq = (a,b)=>{return a===b};
	
	it('1 eq 1',function(){
		const actual = true_if_one_is_true(1, 1, eq);
		assert.deepEqual(actual, true);
	});
	
	it('1 not eq "1"',function(){
		const actual = true_if_one_is_true(1, "1", eq);
		assert.deepEqual(actual, false);
	});

	it('[1, 2, 3] eq 2',function(){
		const o = [1, 2, 3];
		const actual = true_if_one_is_true(o, 2, eq);
		assert.deepEqual(actual, true);
	});

	it('[1, 2, 3] not eq 4',function(){
		const o = [1, 2, 3];
		const actual = true_if_one_is_true(o, 4, eq);
		assert.deepEqual(actual, false);
	});
});

describe('deep_iterate', function(){
	it('deep "+1"',function(){
		const o = {a:{b:1}, c:2};
		let sum = 0;
		deep_iterate(o, (obj) => {
			if (typeof obj === 'object')
				for (let i in obj) 
					if (typeof obj[i] === 'number') sum += obj[i];
		});
		assert.deepEqual(sum, 3);
	});

	it('deep "fill lower levels"',function(){
		let o = {e:0, a:{b:{c:0}, d:0}};
		let amount = 2;
		deep_iterate(o, null, (obj) => {
			if (typeof obj === 'object')
				for (let i in obj) 
					if (typeof obj[i] === 'number' && amount > 0) {
						obj[i]++;
						amount--;
					}
		});
		assert.deepEqual(o, {a:{b:{c:1}, d:1}, e:0});
	});

});

describe('deep_sort', function(){
	const func = (a,b)=>{return (a==b?0:(a>b?1:-1))}
	
	it('[2,3,1] -> [1,2,3]',function(){
		let o = [2, 3, 1];
		deep_sort(o, func);
		assert.deepEqual(o, [1,2,3]);
	});

	it('{a:[2,3,1], b:{c:[2,1], d:[3,2,1,-1]}} -> {a:[1,2,3], b:{c:[1,2], d:[-1,1,2,3]}}',function(){
		let o = {a:[2, 3, 1], b:{c:[2,1], d:[3, 2, 1, -1]}};
		deep_sort(o, func);
		assert.deepEqual(o, {a:[1,2,3], b:{c:[1,2], d:[-1,1,2,3]}});
	});
});
