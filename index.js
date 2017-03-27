//TODO cannot add filter after pseudo (while can add pseudo after filter)
//TODO get({ "a[c]":1 }, "a[c]")) returns [] silently -> should return 'illegal filter'

//TODO? AMD support?
//TODO? add strings? (and remove _replace_escaped_operators)
//TODO? performance?

const { get } = require('./lib/index');

module.exports = { get };
