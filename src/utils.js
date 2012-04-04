(function() {
  var assert, eq, fs, key, log, root, util, val;

  root = this;

  fs = require('fs');

  util = require('util');

  Array.prototype.put = Array.prototype.unshift;

  Array.prototype.take = Array.prototype.shift;

  log = function(n) {
    return console.log(util.inspect(n, false, null));
  };

  eq = function(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  };

  key = function(o) {
    var k, v;
    return ((function() {
      var _results;
      _results = [];
      for (k in o) {
        v = o[k];
        _results.push(k);
      }
      return _results;
    })())[0];
  };

  val = function(o) {
    var k, v;
    return ((function() {
      var _results;
      _results = [];
      for (k in o) {
        v = o[k];
        _results.push(v);
      }
      return _results;
    })())[0];
  };

  assert = function(mode) {
    return function(x, y) {
      if (mode === '-v') {
        if (eq(x, y)) {
          return log(['Pass', x, y]);
        } else {
          return log(['Fail', x, y]);
        }
      } else {
        return log(eq(x, y));
      }
    };
  };

  root.log = log;

  root.eq = eq;

  root.key = key;

  root.val = val;

  root.assert = assert;

}).call(this);
