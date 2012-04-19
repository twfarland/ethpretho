(function() {
  var deeper, defaultAlter, fs, involve, makeTree, matchers, obArr, parseFile, root, toStr, _,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = this;

  fs = require('fs');

  _ = require('./utils.js');

  Array.prototype.put = Array.prototype.unshift;

  Array.prototype.take = Array.prototype.shift;

  toStr = {}.toString;

  obArr = '[object Array]';

  defaultAlter = function(expr, stack) {
    var lower;
    lower = stack[0];
    if (toStr.call(lower) === obArr) {
      return lower.push(expr);
    } else {
      return _.val(lower).push(expr);
    }
  };

  involve = function(expr, stack) {
    expr = stack.take();
    return defaultAlter(expr, stack);
  };

  deeper = function(expr, stack) {
    return stack.put(expr);
  };

  matchers = [
    [
      'comment', function(str) {
        var c, k, res, rest, _len, _ref;
        if (str[0] === ';') {
          _ref = ['', str.slice(1)], res = _ref[0], rest = _ref[1];
          for (k = 0, _len = rest.length; k < _len; k++) {
            c = rest[k];
            if (c === '\n') {
              break;
            } else {
              res += c;
            }
          }
          return [
            {
              c: res
            }, res.length + 2
          ];
        }
      }
    ], [
      'string', function(str) {
        var c, k, res, rest, _len, _ref;
        if (str[0] === '"') {
          _ref = ['', str.slice(1)], res = _ref[0], rest = _ref[1];
          for (k = 0, _len = rest.length; k < _len; k++) {
            c = rest[k];
            if ((c === '"') && (rest[k - 1] !== '\\')) {
              break;
            } else {
              res += c;
            }
          }
          return [
            {
              s: res
            }, res.length + 2
          ];
        }
      }
    ], [
      'openexp', function(str) {
        if (str[0] === '(') return [[], 1];
      }, deeper
    ], [
      'closeexpr', function(str) {
        if (str[0] === ')') return [null, 1];
      }, involve
    ], [
      'openarr', function(str) {
        if (str[0] === '[') {
          return [
            {
              a: []
            }, 1
          ];
        }
      }, deeper
    ], [
      'closearr', function(str) {
        if (str[0] === ']') return [null, 1];
      }, involve
    ], [
      'openobj', function(str) {
        if (str[0] === '{') {
          return [
            {
              o: []
            }, 1
          ];
        }
      }, deeper
    ], [
      'closeobj', function(str) {
        if (str[0] === '}') return [null, 1];
      }, involve
    ], [
      'line', function(str) {
        if (str[0] === '\n') return ['\n', 1];
      }, function(expr, stack) {
        return false;
      }
    ], [
      'space', function(str) {
        var c, k, res, _len, _ref;
        if (str[0] === ' ') {
          res = ' ';
          _ref = str.slice(1);
          for (k = 0, _len = _ref.length; k < _len; k++) {
            c = _ref[k];
            if (c === ' ') {
              res += ' ';
            } else {
              break;
            }
          }
          return [
            {
              w: res
            }, res.length
          ];
        }
      }, function(expr, stack) {
        return false;
      }
    ], [
      'atom', function(str) {
        var c, k, next, res, _len;
        res = '';
        for (k = 0, _len = str.length; k < _len; k++) {
          c = str[k];
          next = str[k + 1];
          if (next && (__indexOf.call(' \n\t()[]{}"', next) >= 0)) {
            res += c;
            break;
          } else {
            res += c;
          }
        }
        return [res, res.length];
      }
    ]
  ];

  makeTree = function(str, stack) {
    var chars, m, match, _i, _len;
    chars = [].slice.call(str);
    while (chars.length !== 0) {
      for (_i = 0, _len = matchers.length; _i < _len; _i++) {
        m = matchers[_i];
        match = m[1](chars);
        if (match) {
          (m[2] || defaultAlter)(match[0], stack);
          chars.splice(0, match[1]);
          break;
        }
      }
    }
    return stack;
  };

  parseFile = function(file, callback) {
    return fs.readFile(file, 'utf-8', function(err, data) {
      return callback(err, makeTree(data, [[]]));
    });
  };

  root.parseFile = parseFile;

}).call(this);
