const { assert } = require('chai');
const { get } = require('../index');
const { isEqualsOverArray } = require('../filter_operators');
const { deep_iterate } = require('../helper');

const test_get = (t, func) => {
	func = func || get;
	t.forEach(_itm => {
		let path     = _itm[0];
		let o        = _itm[1];
		let expected = _itm[2];
		it('"' + path + '" of '+JSON.stringify(o).replace(/\n/g, ' ')+' -> ' + JSON.stringify(expected).replace(/\n/g, ' '),function(){
			let actual =func(o, path);
			assert.deepEqual(actual, expected);
		});
	});
}

describe('simple get 0 level', function(){
	test_get([
		["",  1,     [1]      ], 
		["",  {a:1}, [{a:1}]  ] 
	]);
});

describe('simple get 1 level', function(){
	test_get([
		["*",     1,                            [1]                                       ], 
		["*",     {a:1},                        [{a:1}, 1]                                ], 
		["*",     {a:{c:1}, b:2},               [{a:{c:1},b:2}, {c:1}, 1, 2]              ], 
		
		["a",     1,                            []                                        ], 
		["a",     {b:1},                        []                                        ], 
		["a",     {a:1},                        [1]                                       ], 
		["a",     {a:[1, 2]},                   [1, 2]                                    ], 
		["a",     {a:{b:"x"}},                  [{b:"x"}]                                 ], 
		["a",     {b:{bb:"xxx", a:1}},          [1]                                       ], 
		["a",     [{a:1}, {a:2}, {b:3}],        [1,2]                                     ], 
		["a",     [[{a:1}, {a:2}], [{a:3}]],    [1,2,3]                                   ], 
		["a",     [[[{a:1}, {a:2}], [{a:3}]],[[{a:4}, {a:5}],[{a:6}]]],     [1,2,3,4,5,6] ], 

		["a",     {a:{a:[1, 2]}},               [{a:[1, 2]}, 1, 2]                        ],
		[".a",    {a:{a:[1, 2]}},               [{a:[1, 2]}]                              ],
		["a",     [[[[[{a:1}]]]]],              [1]                                       ],
		["a",     {a:[[[[[1]]]]]},              [1]                                       ]
	]);
});

describe('simple get 2 level', function(){
	test_get([
		["a.b",   {a:{b:"x"}},                  ["x"]                                     ], 

		["a *",   {x:{a:1, z:{a:2}}},           [1, 2]                                    ], 
		["a b",   {a:{b:{c:1}}},                [{c:1}]                                   ], 
		["a b",   {a:{c:{b:1}}},                [1]                                       ],
		
		["* a",   {a:{a:1}},                    [{"a":1},1]                               ],
		["a *",   {a:{a:1}},                    [{"a":1},1]                               ]
	]);
});

describe('simple get 3 level', function(){
	let o = {
		a:{
			b:{
				b:{
					c:1, 
				}, 
				c:{
					d:2
				}
			}, 
			c:0,
			x:{
				b:{
					c:3 
				} 
			}
		}
	}
	test_get([
		["a.b.c", {a:{b:{c:[1,2]}}},            [1,2]          ], 
		["a.b.c", {a:{b:[ {c:1}, {c:2} ]}},     [1,2]          ], 
		["a.b.c", {a:[ {b:{c:1}}, {b:{c:2}} ]}, [1,2]          ], 
		["a.b.c", o,                            [{d:2}]        ], 
		["a.b c", o,                            [{d:2}, 1]     ],
		["a b c", o,                            [{d:2}, 1, 3]  ],
		["a b c", {a:{b:{b:{c:1}}}},            [1]            ],
		["a b c", {a:{b:{b:{c:{z:1}}}}},        [{z:1}]        ],

		[".*", {a:1, b:2, c:{d:3}},             [1,2,{d:3}]    ],

		["a * c", {a:{b:{c:[1,2]},c:3}},        [3,1,2]        ],
		[".a.*.c", {a:{b:{c:[1,2]},c:3}},       [1,2]          ]
	]);
});

describe('pseudo', function(){
	test_get([
		[':empty',  {a:[{b:[1,2]}, {b:3}]},  [1,2,3]   ]
	]);
});

describe('filter', function(){
	let o = {
		x:{
			a:[
				{b:1,c:"x"}, 
				{b:2,c:"y"}
			], 
			b:{
				c:1
			}
		}
	}
	let o2 = {
		a:{
			x:[
				{b:1,c:"x"}, 
				{b:2,c:"y"}
			]
		}, 
		b:{
			c:1
		}
	}
	test_get([
		['[ ]',         {a:1},                      [{a:1}, 1]                    ],
		['[a= 1]',      {a:1},                      [{a:1}]                       ],
		['[a=1= 1\\=1]',{a:"1= 1=1"},               [{a:"1= 1=1"}]                ],
		['[a\\=1=1]',   {"a=1":1},                  [{"a=1":1}]                   ],
		['[a= 1]',      {a:2},                      []                            ],
		['[a =1]',      {a:1, b:1},                 [{a:1, b:1}]                  ],
		['[ a = 1 ]',   {a:[1,2]},                  [{a:[1]}]                     ],
		['[a=1]',       [{a:1}, {a:2}],             [{a:1}]                       ],
		['[a.b=1]',     {a:{b:1, c:"x"}, b:{c:1}},  [{a:{b:1,c:"x"}, b:{c:1}}]    ],

		['[a.b=1]', o, 
                 [{x:{a:[{b:1,c:"x"}], b:{c:1}}}, {a:[{b:1,c:"x"}], b:{c:1}}]     ],
                 
		['[.a.b=1]', o, 
                 [{a:[{b:1,c:"x"}], b:{c:1}}]                                     ],
                 
		['[a b=1]', o, 
                 [{x:{a:[{b:1,c:"x"}],b:{c:1}}},{a:[{b:1,c:"x"}],b:{c:1}}]        ],
                 
		['[a b=1]', o2, 
                 [{a:{x:[{b:1,c:"x"}]},b:{c:1}}]                                  ],

		['[a.x.b=1]', o2, 
                 [{a:{x:[{b:1,c:"x"}]},b:{c:1}}]                                  ],

		['[a.y.b=1]', o2,                           []                            ],
		
		['[.a=1][b=1]', [{a:1, c:{b:1}},{a:1,b:2}], [{a:1, c:{b:1}}]              ],
		['[a=1][.b=1]', [{a:1, c:{b:1}},{a:1,b:2}], []                            ]
	]);
	
});

describe('filter *=', function(){
	test_get([
		['[a*=art]', {a:'2artem'},                  [{a:'2artem'}]                ],
		['[a*=art]', {a:'xxx'},                     []                            ]
	]);
});

describe('filter ^=', function(){
	test_get([
		['[a^=art]', {a:'artem'},                   [{a:'artem'}]                 ],
		['[a^=art]', {a:'2artem'},                  []                            ]
	]);
});

describe('filter $=', function(){
	test_get([
		['[a$=em]', {a:'artem'},                   [{a:'artem'}]                 ],
		['[a$=em]', {a:'artem2'},                  []                            ]
	]);
});

describe('filter ~=', function(){
	test_get([
		['[a~=xxx]', {a:'111 xxx yyy'},             [{a:'111 xxx yyy'}]          ],
		['[a~=xxx]', {a:'111 xxxyyy'},              []                           ]
	]);
});

describe('filter |=', function(){
	test_get([
		['[a|=xxx]', {a:'xxx-yyy'},                 [{a:'xxx-yyy'}]              ],
		['[a|=xxx]', {a:'yyy-xxx'},                 []                           ],
		['[a|=xxx]', {a:'xxx'},                     [{a:'xxx'}]                  ],
		['[a|=xxx]', {a:'zxxx'},                    []                           ]
	]);
});

describe('filter [attr]', function(){
	test_get([
		['[a]',      {a:'a'},                       [{a:'a'}]                    ],
		['[a]',      [{a:'xxx'}, {b:'b'}],          [{a:'xxx'}]                  ],
		['[a]',      {b:'b'},                       []                           ]
	]);
});

describe('complex get', function(){
	var o2 = {
		  a:{
		    b:[
		      {name:1,c:{d:1}},
		      {name:2,c:{d:2}}
		    ],
		    c:{
		      d:[
		        {name:1,d:{c:3}},
		        {name:2,d:{c:4}}
		      ],
		      e:4
		    }
		  }
	}
	var o1 = {
		  a:[
		      {name:1,z:{d:1}},
		      {name:2,z:{name:2,d:2}},
		      {z:{name:1,d:3}},
		      {z:{name:2,d:4}}
                  ],
		  x:{
		    name:1,
		    z:100
		  }
		}
	var json_query_test = {
	  grouped_people: {
	    'enemies': [
	      {name: 'Evil Steve', country: 'AU'},
	      {name: 'Betty', country: 'NZ'}
	    ]
	  }
	}		
	var json_query_test_2 = {
		grouped_people: {
			'friends': [
				{name: 'Steve', country: 'NZ'},
				{name: 'Jane', country: 'US'},
				{name: 'Mike', country: 'AU'},
				{name: 'Mary', country: 'NZ'},
			],
			'enemies': [
				{name: 'Evil Steve', country: 'AU'},
				{name: 'Betty', country: 'NZ'}
			]
		}
	}

	test_get([ 
		["a[name=1]",     {x:{a:{name:1}}, y:{a:{name:2}}},              [{name:1}]          ], 
		["x[a.name=1]",   {x:{a:{name:1}}, y:{a:{name:2}}},              [{a:{name:1}}]      ], 
		["[name=1]",      [{name:[1,2], x:1},{name:2, x:2}],             [{name:[1], x:1}]   ], 
		["a[name=1] b",   {x:{a:{name:1, b:2}}, y:{a:{name:2, b:3}}},    [2]                 ], 
		["a[.name=1] b",   {x:{a:{name:1, b:2}}, y:{a:{name:"1", b:3}}}, [2, 3]              ], 
		["a b[name=1] c", {a:{b:[{name:1,c:{d:1}},{name:2,c:{d:2}}]}},   [{d:1}]             ], 
		["a [.name=1] c",  o2,                                           [{d:1}, 3]          ],

		["a[name=1].z",   o1,                                            [ { d: 1 }, { name: 1, d: 3 } ]     ],
		["a[.name=1].z",  o1,                                            [{d:1}]                             ],
		["a.z[name=1]",   o1,                                            [{name:1, d:3}]                     ],
		["a.z[name=1] d", o1,                                            [3]                                 ],
		["a.z[name=2] d", o1,                                            [2,4]                               ],
		
		["[.country=NZ]", json_query_test,                               [{name: 'Betty', country: 'NZ'}]    ],
		["grouped_people[country=NZ]", json_query_test_2,                
			[{
				friends: [{name: "Steve",country: "NZ"},{name: "Mary",country: "NZ"}],
				enemies:[{name: "Betty", country: "NZ"}]
			}]															                                     ]
	]);
});

describe('get with new filter', function(){
	const get_with_new_filter = (data, path) => {
		return get(data, path, {
			operator : {
				"!=" : function(complexFieldValue, value){
					return isEqualsOverArray(complexFieldValue, value, (a,b)=>{return a!=b;});
				},
			}
		})
	}

	test_get([ 
		["a[name!=1]",     [{a:{name:1}}, {a:{name:2}}, {a:{name:3}}],      [{name:2}, {name:3}]     ], 
	], get_with_new_filter);
});

describe('get with wrong pseudo', function(){
	test_get([ 
		["a:abc b",     [{a:{b:1}}, {a:{c:2}}, {a:{d:3}}],      [1]     ], 
	]);
});

describe('get with new pseudo', function(){
	const get_with_new_pseudo = (data, path) => {
		return get(data, path, {
			pseudo : {
				"abc" : function(value){
					deep_iterate(value, (_obj) => {
						for(var i in _obj) {
							if (typeof _obj[i] !== 'object') _obj[i] = _obj[i] + 'abc';
						}
					});
					return value;
				},
			}
		})
	}

	test_get([ 
		["a:abc b",     [{a:{b:1}}, {a:{c:2}}, {a:{d:3}}],      ['1abc']     ], 
	], get_with_new_pseudo);
});