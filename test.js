'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var writeJson = require('write-json');
var del = require('delete');
var store = require('./');
var bower;

var fixtures = path.resolve.bind(path, 'fixtures');
function exists(fp) {
  try {
    fs.statSync(fp);
    return true;
  } catch (err) {}
  return false;
}

describe('store', function() {
  beforeEach(function(cb) {
    writeJson(fixtures('bower.json'), {}, function(err) {
      if (err) return cb(err);
      bower = store(fixtures());
      cb();
    });
  });

  afterEach(function(cb) {
    del(fixtures(), cb);
  });

  describe('resolve store path', function() {
    it('should get a store at the given `cwd`', function(cb) {
      writeJson(fixtures('foo/bower.json'), {}, function(err) {
        if (err) return cb(err);
        bower = store(fixtures('foo'));
        bower.set('foo', 'bar');
        assert.equal(path.basename(bower.path), 'bower.json');
        assert(bower.data.hasOwnProperty('foo'));
        assert.equal(bower.data.foo, 'bar');
        assert(exists('fixtures/foo/bower.json'));
        cb();
      });
    });

    it('should get a store at the given `options.path`', function(cb) {
      writeJson(fixtures('foo/bar.json'), {}, function(err) {
        if (err) return cb(err);
        bower = store({path: fixtures('foo/bar.json')});
        bower.set('foo', 'bar');
        assert.equal(path.basename(bower.path), 'bar.json');
        assert(bower.data.hasOwnProperty('foo'));
        assert.equal(bower.data.foo, 'bar');
        assert(exists('fixtures/foo/bar.json'));
        cb();
      });
    });
  });

  describe('.set', function() {
    it('should `.set()` a value on the store', function() {
      bower.set('one', 'two');
      assert.equal(bower.data.one, 'two');
    });

    it('should `.set()` an object', function() {
      bower.set({four: 'five', six: 'seven'});
      assert.equal(bower.data.four, 'five');
      assert.equal(bower.data.six, 'seven');
    });

    it('should `.set()` a nested value', function() {
      bower.set('a.b.c.d', {e: 'f'});
      assert.equal(bower.data.a.b.c.d.e, 'f');
    });
  });

  describe('.union', function() {
    it('should `.union()` a value on the store', function() {
      bower.union('one', 'two');
      assert.deepEqual(bower.data.one, ['two']);
    });

    it('should not union duplicate values', function() {
      bower.union('one', 'two');
      assert.deepEqual(bower.data.one, ['two']);

      bower.union('one', ['two']);
      assert.deepEqual(bower.data.one, ['two']);
    });

    it('should concat an existing array:', function() {
      bower.union('one', 'a');
      assert.deepEqual(bower.data.one, ['a']);

      bower.union('one', ['b']);
      assert.deepEqual(bower.data.one, ['a', 'b']);

      bower.union('one', ['c', 'd']);
      assert.deepEqual(bower.data.one, ['a', 'b', 'c', 'd']);
    });
  });

  describe('.has', function() {
    it('should return true if a key `.has()` on the store', function() {
      bower.set('foo', 'bar');
      bower.set('baz', null);
      bower.set('qux', undefined);

      assert(bower.has('baz'));
      assert(bower.has('foo'));
      assert(!bower.has('bar'));
      assert(!bower.has('qux'));
    });

    it('should return true if a nested key `.has()` on the store', function() {
      bower.set('a.b.c.d', {x: 'zzz'});
      bower.set('a.b.c.e', {f: null});
      bower.set('a.b.g.j', {k: undefined});

      assert(bower.has('a.b.c.d'));
      assert(bower.has('a.b.c.d.x'));
      assert(bower.has('a.b.c.e'));
      assert(bower.has('a.b.g.j'));
      assert(bower.has('a.b.c.e.f'));

      assert(!bower.has('a.b.bar'));
      assert(!bower.has('a.b.c.d.z'));
      assert(!bower.has('a.b.c.e.z'));
      assert(!bower.has('a.b.g.j.k'));
      assert(!bower.has('a.b.g.j.z'));
    });
  });

  describe('.get', function() {
    it('should `.get()` a stored value', function() {
      bower.set('three', 'four');
      assert.equal(bower.get('three'), 'four');
    });

    it('should `.get()` a nested value', function() {
      bower.set({a: {b: {c: 'd'}}});
      assert.equal(bower.get('a.b.c'), 'd');
    });
  });

  describe('.save', function() {
    it('should save the store', function() {
      bower.set('three', 'four');
      bower.save();
      var obj = require(fixtures('bower.json'));
      assert.deepEqual(obj, {three: 'four'});
    });
  });

  describe('.del', function() {
    it('should `.del()` a stored value', function() {
      bower.set('a', 'b');
      bower.set('c', 'd');
      assert(bower.data.hasOwnProperty('a'));
      assert.equal(bower.data.a, 'b');

      assert(bower.data.hasOwnProperty('c'));
      assert.equal(bower.data.c, 'd');

      bower.del('a');
      bower.del('c');
      assert(!bower.data.hasOwnProperty('a'));
      assert(!bower.data.hasOwnProperty('c'));
    });

    it('should `.del()` multiple stored values', function() {
      bower.set('a', 'b');
      bower.set('c', 'd');
      bower.set('e', 'f');
      bower.del(['a', 'c', 'e']);
      assert.deepEqual(bower.data, {});
    });
  });

  describe('.rm', function() {
    it('should delete bower.json', function() {
      bower.set('a', 'b');
      bower.set('c', 'd');
      assert(bower.data.hasOwnProperty('a'));
      assert.equal(bower.data.a, 'b');

      assert(bower.data.hasOwnProperty('c'));
      assert.equal(bower.data.c, 'd');

      assert(exists(bower.path));
      bower.rm();
      assert(!exists(bower.path));
    });
  });
});
