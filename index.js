/*!
 * bower-store <https://github.com/jonschlinkert/bower-store>
 *
 * Copyright (c) 2016, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var cache = require('cache-base');
var Cache = cache.namespace('data');
var utils = require('./utils');

/**
 * Initialize a new `Bower` store at the given `cwd` with
 * the specified `options`.
 *
 * ```js
 * var bower = require('bower-store')(process.cwd());
 *
 * console.log(bower.path);
 * //=> '~/your-project/bower.json'
 *
 * console.log(bower.data);
 * //=> {name: 'your-project', ...}
 * ```
 *
 * @param  {String} `cwd` Directory of the bower.json to read.
 * @param  {Object} `options` Options to pass to [expand-bower][] and [normalize-bower][].
 * @api public
 */

function Bower(cwd, options) {
  if (!(this instanceof Bower)) {
    return new Bower(cwd, options);
  }

  Cache.call(this);

  if (utils.isObject(cwd)) {
    options = cwd;
    cwd = null;
  }

  this.options = options || {};
  this.cwd = this.options.cwd || cwd || process.cwd();
  this.path = this.options.path || path.resolve(this.cwd, 'bower.json');
  var data;

  Object.defineProperty(this, 'data', {
    configurable: true,
    enumerable: true,
    set: function(val) {
      data = val;
    },
    get: function() {
      return data || (data = this.read());
    }
  });
}

/**
 * Inherit `cache-base`
 */

util.inherits(Bower, Cache);

/**
 * Concatenate the given val and uniquify array `key`.
 *
 * ```js
 * bower.union('keywords', ['foo', 'bar', 'baz']);
 * ```
 * @param {String} `key`
 * @param {String} `val` Item or items to add to the array.
 * @return {Object} Returns the instance for chaining.
 * @api public
 */

Bower.prototype.union = function(key, val) {
  utils.union(this.data, key, val);
  return this;
};

/**
 * Write the `bower.data` object to `bower.path` on the file system.
 *
 * ```js
 * bower.save();
 * ```
 * @api public
 */

Bower.prototype.save = function() {
  utils.writeJson.sync(this.path, this.data);
};

/**
 * Delete the `bower.json` file at `bower.path`.
 *
 * ```js
 * bower.rm();
 * ```
 * @api public
 */

Bower.prototype.rm = function() {
  utils.del.sync(this.path);
};

/**
 * Reads `bower.path` from the file system and returns an object.
 *
 * ```js
 * var data = bower.read();
 * ```
 * @api public
 */

Bower.prototype.read = function() {
  if (utils.exists(this.path)) {
    return JSON.parse(fs.readFileSync(this.path, 'utf8'));
  }
  return {};
};

/**
 * Expoe `Bower`
 */

module.exports = Bower;
