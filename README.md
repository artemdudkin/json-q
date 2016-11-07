# json-q 

Retrieves values from JSON objects (and JavaScript objects) by css-selector-like query (includes attribute filters and array flattening).

[![Coverage Status](https://coveralls.io/repos/github/artemdudkin/json-q/badge.svg?branch=master)](https://coveralls.io/github/artemdudkin/json-q?branch=master)

_I am not clever enough to use XPath over objects (via [JSONPath](https://github.com/s3u/JSONPath), [ObjectPath](http://objectpath.org/) or [DefiantJs](http://defiantjs.com/)), while I like CSS selectors. [JSONSelect](https://github.com/lloyd/JSONSelect) looks abandoned, [json-query](https://github.com/mmckegg/json-query) looks overcomplicated; so I created more simple query language (inspired by CSS attribute selectors)._

## Example

```js
const {get} = require('json-q');

const data = {
  a:{
    b:[
      {name:'xxx',c:{d:1}},
      {name:'yyy',c:{d:2}}
    ]
  }
};

get(data, "a b[.c.d=1] name"); //=> ['xxx']
```

## API

### `get(object, selector, opt)`

Returns array of all fields of _object_ from any level of nesting that satisfies _selector_ (with expansions via _opt_).

About selectors:

- **"a"**   means: get value of all fields named "a" from all nested level of given object
- **".a"**  means: get value of field named "a" from first level of given object (i.e. object["a"])
- **"a b"** means: get all values of all fields "b", that are nested of field "a", that can be at any level of given object
- **".a.b"** means: get field "b", that is direct descendant of field "a" from first level of given object (i.e. object.a.b)

About filters:

- you can add filter of any depth at any level like this: **"a.b[x.y=23] c"**
- combination of filters **"[.x=23][.y=3]"** means "items heaving field x=23 AND field y=3"
- you can use [attr] [attr=value] [attr~=value] [attr|=value] [attr^=value] [attr$=value] [attr*=value] [attr=value] - just like CSS attribute filters do

About pseudos:

- do you remember CSS pseudo-classes? All that :focus, :active, :hover etc.? Pretty useless for objects, even :empty and :first-child, but it is a good concept to add user-defined (parameterless) functions. 
- you can add it anywhere: **"a b:empty.c"**
- look at :empty and see the section about expansions

Another thing - I consider array as multiple values of field, so 

 1. arrays of arrays become flat, i.e. {a:[[1], [2,3]]} becomes {a:[1, 2, 3]}}
 
 2. you can not address array items by index, i.e.
 
```js

var data = {
  a:{
    b:{
      c:[1,2]
    }
  }
};

get(data, ".a.b.c"); //=> [1,2]
get(data, ".a.b.c.0"); //=> []


var data = {
  a:{
    b:[
      {c:1},
      {c:2}
    ]
  }
}

get(data, ".a.b.c"); //=> [1,2] also
```

## Expansions (i.e. opt param at get)

You can add your own filter or pseudo (or re-define existing one). The difference between them is that filter can only filter (obviously) while pseudo can do anything with intermediate result - i.e. delete, add, change (at any depth) objects at result array.

For instance, new filter for [a!=some value]

```js
var d = [{a:{name:1}}, {a:{name:2}}]
var p = "a[name!=1]";

get( d, p, {
  operator : {
    "!=" : function(complexFieldValue, value){
      return equals_if_one_of_it_equals(complexFieldValue, value, (a,b)=>{return a!=b;});
    },
  }
}); // => [{name:2}]
```

And pseudo for add "abc" string to all fields names at any level (dont ask me what for)

```js
var d = [{a:{b:1}}, {a:{c:2}}]
var p = "a:abc.cabc";

get( d, p, {
  pseudo : {
    "abc" : function(arrValue){
      return arrValue.map(value => {
        deep_iterate(value, (_obj) => {
          for(var i in _obj) {
            if (typeof _obj[i] !== 'object') {
              _obj[i+'abc'] = _obj[i];
              delete _obj[i];
            }
          }
        });
        return value;
      })
    },
  }
}); // => [2]
```

## License

MIT
