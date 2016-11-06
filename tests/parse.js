const { assert } = require('chai');
const { parse, Errors } = require('../parse');
const { parse_filter } = require('../parse_filter');

const test2 = (func, t)	=> {
	t.forEach(_itm => {
		let var0    = _itm[0];
		let expected = _itm[1];
		
		it('"' + var0 + '" -> '+ JSON.stringify(expected).replace(/\n/g, ' '),function(){
			assert.deepEqual(func(var0), expected);
		});
	})
}

describe('parse', function(){
	test2(parse, [
		[1,                  [{any:"1"}]                                                              ], 	
		["a",                [{any:"a"}]                                                              ], 
		[".a",               [{next:"a"}]                                                             ], 
		["a  b",             [{any:"a"}, {any:"b"}]                                                   ], 
		["a.x b",            [{any:"a"}, {next:"x"}, {any:"b"}]                                       ],   
		["a[ x = 1 ] b",     [{any:"a", transformation:[{filter:"x = 1"}]}, {any:"b"}]                ], 
		["a[x= 1].c b",      [{any:"a", transformation:[{filter:"x= 1"}]}, {next:"c"}, {any:"b"}]     ], 
		["a.c[x=1 ]  b",     [{any:"a"}, {next:"c", transformation:[{filter:"x=1"}]}, {any:"b"}]      ], 
		["a.c[ x.y = 1 ] b", [{any:"a"}, {next:"c", transformation:[{filter:"x.y = 1"}]}, {any:"b"}]  ],

		["[x=1\\=1]",        [{any:"*", transformation:[{filter:"x=1\\=1"}]}]                         ],
		["\\[x=1\\=1\\]",    [{any:"\\[x=1\\=1\\]"}]                                                  ],
		[" a\\ b  ",         [{any:"a\\ b"}]                                                          ], 		
		
		["[x=1][y=2]",       [{any:"*", transformation:[{filter:"x=1"},{filter:"y=2"}]}]              ],

		[":a",               [{any:"*", transformation:[{pseudo:"a"}]}]                               ],
		[":a:rfg ",          [{any:"*", transformation:[{pseudo:"a"}, {pseudo:"rfg"}]}]               ],
		["[x=1]:a",          [{any:"*", transformation:[{filter:"x=1"}, {pseudo:"a"}]}]               ],
		
		["[x:1]",            [{any:"*", transformation:[{filter:"x:1"}]}]                             ],		
		["x:1[y=1]",         [{any:"x", transformation:[{pseudo:"1[y=1]"}]}]                          ]		
	]);

	it('"[x=1]b:a" -> error',function(){
		assert.throws(()=>{parse("[x=1]b:a")}, Errors.CHARS_AFTER_TRANSFORMATION);
	});
	it('"..a" -> error',function(){
		assert.throws(()=>{parse("..a")}, Errors.DOT_WITHOUT_LEVEL_NAME);
	});
	it('"[[" -> error',function(){
		assert.throws(()=>{parse("[[")}, Errors.FILTER_OPEN_FAIL);
	});
	it('"]" -> error',function(){
		assert.throws(()=>{parse("]")}, Errors.FILTER_CLOSE_FAIL);
	});
});

describe('parse_filter', function(){
	test2(parse_filter, [
		[undefined,          {left:""}                                              ],
		['',                 {left:""}                                              ],
		[1,                  {left:"1"}                                             ], 		
		["a",                {left:"a"}                                             ], 
		["=b",               {left:"",    right:'b',   delimiter:'='}               ], 
		["a=b",              {left:"a",   right:'b',   delimiter:'='}               ], 
		[" x y = b c ",      {left:"x y", right:'b c', delimiter:'='}               ], 
		["a=b=c",            {left:"a",   right:'b=c', delimiter:'='}               ], 
		["a\\=b=c",          {left:"a=b", right:'c',   delimiter:'='}               ], 
		["a=b\\=c",          {left:"a",   right:'b=c', delimiter:'='}               ],
		['a*=b',             {left:"a",   right:'b',   delimiter:'*='}              ]
	]);
});
