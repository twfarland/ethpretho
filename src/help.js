(function() {
  var fs, util, _;

  fs = require('fs');

  util = require('util');

  _ = this;

  _.log = function(n) {
    return console.log(util.inspect(n, false, null));
  };

  _.eq = function(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  };

  _.key = function(o) {
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

  _.val = function(o) {
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

  _.assert = function(mode) {
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

  _.toStr = {}.toString;

  _.obArr = '[object Array]';

  _.obObj = '[object Object]';

  _.isComment = /^;.*/;

  _.isStr = /^\"(([^\"]|(\\\\\"))*[^\\\\])?\"/;

  _.isSpace = /^\s+/;

  _.isAtom = /^[^\;\"\n\t\(\)\[\]\{\}\s]+/;

  _.isInt = /\d+/;

  _.isSymbol = /^[\_|\|$A-z][\_|\|$A-z|\d]*/;

}).call(this);
