(function() {
  var deeper, defaultAlter, fs, involve, makeTree, matchers, parseFile, root, _;

  root = this;

  fs = require('fs');

  _ = require('./help.js');

  defaultAlter = function(expr, stack) {
    var lower;
    lower = stack[0];
    if (_.toStr.call(lower) === _.obArr) {
      return lower.push(expr);
    } else {
      return _.val(lower).push(expr);
    }
  };

  involve = function(expr, stack) {
    try {
      expr = stack.shift();
      return defaultAlter(expr, stack);
    } catch (e) {
      throw new Error("Parse error: " + JSON.stringify(stack));
    }
  };

  deeper = function(expr, stack) {
    return stack.unshift(expr);
  };

  matchers = [
    [
      'comment', function(str) {
        var chomp;
        chomp = _.isComment.exec(str);
        if (chomp) {
          return [
            {
              c: chomp[0].slice(1)
            }, chomp[0].length
          ];
        }
      }
    ], [
      'string', function(str) {
        var chomp;
        chomp = _.isStr.exec(str);
        if (chomp) {
          return [
            {
              s: chomp[0].slice(1, -1)
            }, chomp[0].length
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
      'space', function(str) {
        var chomp;
        chomp = _.isSpace.exec(str);
        if (chomp) {
          return [
            {
              w: chomp[0]
            }, chomp[0].length
          ];
        }
      }, function(expr, stack) {
        return false;
      }
    ], [
      'atom', function(str) {
        var chomp;
        chomp = _.isAtom.exec(str);
        if (chomp) return [chomp[0], chomp[0].length];
      }
    ], [
      'nomatch', function(str) {
        return [' ', 1];
      }
    ]
  ];

  makeTree = function(str, stack) {
    var m, match, _i, _len;
    while (str.length !== 0) {
      for (_i = 0, _len = matchers.length; _i < _len; _i++) {
        m = matchers[_i];
        match = m[1](str);
        if (match) {
          (m[2] || defaultAlter)(match[0], stack);
          str = str.slice(match[1]);
          break;
        }
      }
    }
    if (stack.length === 1) {
      return stack;
    } else {
      throw new Error('Parse error: ' + JSON.stringify(stack));
    }
  };

  parseFile = function(file, callback) {
    return fs.readFile(file, 'utf-8', function(err, data) {
      return callback(err, makeTree(data, [[]]));
    });
  };

  root.parseFile = parseFile;

}).call(this);
