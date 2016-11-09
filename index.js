//FIX fix difference between wsdl parsed by json-q and by old parser

//TODO? get rid of clone (https://github.com/pvorb/node-clone) as it uses Buffers which means adding 23k minified Buffers lib at browser?
//TODO? AMD support?
//TODO? add strings? (and remove _replace_escaped_operators)
//TODO? performance?

const { get } = require('./lib/index');

module.exports = { get };
