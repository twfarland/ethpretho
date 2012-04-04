(function() {
  var all2d, expand, fs, key, log, pEq, parse, util, val;

  fs = require('fs');

  util = require('util');

  parse = require('./parse').parseFile;

  parse('exprs.eth', function(err, tree) {
    return log(tree);
  });

  Array.prototype.put = Array.prototype.unshift;

  Array.prototype.take = Array.prototype.shift;

  log = function(n) {
    return console.log(util.inspect(n, false, null));
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

  all2d = function(test, xs, ys) {
    var k, x, y, _len;
    if (xs.length === ys.length) {
      for (k = 0, _len = xs.length; k < _len; k++) {
        x = xs[k];
        y = ys[k];
        if (!(y && test(x, y))) return false;
      }
      return true;
    } else {
      return false;
    }
  };

  pEq = function(x, y) {
    var xtype, ytype;
    xtype = typeof x;
    ytype = typeof y;
    if (xtype === ytype) {
      if (xtype === 'string') {} else {
        xtype = {}.toString.call(x);
        ytype = {}.toString.call(y);
        if (xtype === ytype) {
          if (xtype === '[object Array]') {
            return all2d(pEq, x, y);
          } else {
            return key(x) === key(y) && all2d(pEq, val(x), val(y));
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  };

  expand = function(pattern, source, template) {
    var e, test, toReplace;
    toReplace = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = template.length; _i < _len; _i++) {
        e = template[_i];
        if ({}.toString.call(e) === '[object Array]') _results.push(e);
      }
      return _results;
    })();
    if (pattern.length === 0) {
      if (toReplace.length === 0) {
        return template;
      } else {
        return false;
      }
    } else {
      return test = buildMatcher(pattern[0]);
    }
  };

}).call(this);
