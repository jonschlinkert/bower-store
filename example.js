'use strict';

var bower = require('./')(process.cwd());

bower.union('keywords', 'foo');
bower.union('keywords', 'bar');
bower.union('keywords', 'baz');

console.log(bower.data);
