# json-selector
Retrieves values from JSON objects (and JavaScript objects) by css-selector-like query (includes attribute filters and array flattening).

I am not clever enough to use XPath over objects (using [JSONPath](https://github.com/s3u/JSONPath), [ObjectPath](http://objectpath.org/) or [DefiantJs](http://defiantjs.com/)), so I created more simple query-language.

## API

```js
var get = require('json-selector')
```

### `get(object, selector)`

Returns array all fields from any level of nesting that satisfies selector.

```js

var data = {
  a:{
    b:[
      {name:1,c:{d:1}},
      {name:2,c:{d:2}}
    ]
  }
}

get("a b[.name=1] c", data); //=> [{d:1}]
```

#### Details:

- "a"   means: get all fields named "a" from all nested level of given object
- ".a"  means: get all fields named "a" from first level of given object
- "a.b" means: get field b, that is direct descendant of field a, that can be at any level of given object
- "a b" means: get field b, that is nested field of field a, that can be at any level of given object

And you can add filter of any depth at any level like this: "a.b[x.y=23] c"

Another thing - I consider array as multiple values of field, so you can not address array items by index, i.e.
```js

var data = {
  a:{
    b:{
      c:[1,2]
    }
  }
};

get(".a.b.c", data); //=> [1,2]
get(".a.b.c.0", data); //=> []


var data = {
  a:{
    b:[
      {c:1},
      {c:2}
    ]
  }
}

get(".a.b.c", data); //=> [1,2] also
```


## License

MIT
