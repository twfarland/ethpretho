(function() {
  var binaryPr, block, blockCreators, branchers, dualPr, fs, getSemi, isBrancher, log, obArr, op, pairize, parse, prepBranch, prim, root, toJs, toStr, unaryPr, util, wrap, _, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _ref3,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = this;

  _ = require('./utils.js');

  parse = require('./parse.js');

  fs = require('fs');

  util = require('util');

  toStr = {}.toString;

  obArr = '[object Array]';

  log = _.log;

  pairize = function(arr) {
    var k, odd, res, v, _len;
    odd = false;
    res = [];
    for (k = 0, _len = arr.length; k < _len; k++) {
      v = arr[k];
      if (odd) {
        res.push([arr[k - 1], v]);
        odd = false;
      } else {
        odd = true;
      }
    }
    return res;
  };

  branchers = ['??', 'switch'];

  blockCreators = branchers.concat(['for']);

  prim = {
    ':=': function(e, p) {
      return 'var ' + prim['='](e, p);
    },
    '=': function(e, p) {
      if (toStr.call(e[1]) === obArr) {
        return toJs(e[1][0], '=') + ' = ' + toJs(['->', e[1].slice(1)].concat(e.slice(2)), '=');
      } else {
        return toJs(e[1], '=') + ' = ' + toJs(e[2], '=');
      }
    },
    '.': function(e, p) {
      var e_, fCall, key;
      if (toStr.call(e[2]) === obArr) {
        key = e[2][0];
      } else {
        key = '"' + e[2] + '"';
      }
      if (e.slice(3).length > 0) {
        fCall = '(' + ((function() {
          var _i, _len, _ref, _results;
          _ref = e.slice(3);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            _results.push(toJs(e_, '.'));
          }
          return _results;
        })()).join(', ') + ')';
      } else {
        fCall = '';
      }
      return toJs(e[1], '[]') + '[' + key + ']' + fCall;
    },
    '->': function(e, p) {
      return '(function (' + e[1].join(', ') + ') ' + block(e.slice(2), '->') + ')';
    },
    'return': function(e, p) {
      return 'return ' + toJs(e[1], 'return') + ';';
    },
    ',,': function(e, p) {
      return block(e.slice(1), p);
    },
    '??': function(e, p) {
      var prd, res;
      if (p === '->' || p === '') {
        prd = e.slice(1);
        res = 'if (' + toJs(prd[0], '??') + ') ' + block(prepBranch(prd[1]), p);
        prd.splice(0, 2);
        while (prd.length !== 0) {
          if (prd.length === 1) {
            res += ' else ' + block(prepBranch(prd[0]), p);
            prd.splice(0, 1);
          } else {
            res += ' else if (' + toJs(prd[0], '??') + ') ' + block(prepBranch(prd[1]), p);
            prd.splice(0, 2);
          }
        }
        return res;
      } else {
        return toJs([['->', [], e]], p);
      }
    },
    'for': function(e, p) {
      var e_, last, pre;
      if (p === '->' || p === '') {
        return 'for (' + ((function() {
          var _i, _len, _ref, _results;
          _ref = e[1];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            _results.push(toJs(e_, ''));
          }
          return _results;
        })()).join('; ') + ') ' + block(e.slice(2), '');
      } else {
        pre = e.slice(0, -1);
        last = e.slice(-1);
        return toJs([
          [
            '->', [], [
              ':=', 'res_', {
                a: []
              }
            ], pre.concat([['res_.push', last[0]]]), 'res_'
          ]
        ]);
      }
    }
  };

  wrap = function(res, p) {
    if (p === '' || p === '=') {
      return res;
    } else {
      return '(' + res + ')';
    }
  };

  binaryPr = function(sym) {
    return function(e, p) {
      var e_;
      return wrap(((function() {
        var _i, _len, _ref, _results;
        _ref = e.slice(1);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          e_ = _ref[_i];
          _results.push(toJs(e_, sym));
        }
        return _results;
      })()).join(' ' + sym + ' '), p);
    };
  };

  unaryPr = function(sym) {
    return function(e, p) {
      if (p === '') {
        return wrap(e[1] + sym, p);
      } else {
        return wrap(e[1] + sym + ', ' + e[1], p);
      }
    };
  };

  dualPr = function(sym) {
    return function(e, p) {
      var e_;
      if (e.length === 2) {
        return wrap(sym + e[1] + ')', p);
      } else {
        return wrap(((function() {
          var _i, _len, _ref, _results;
          _ref = e.slice(1);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            _results.push(toJs(e_, sym));
          }
          return _results;
        })()).join(' ' + sym + ' '), p);
      }
    };
  };

  _ref = ['*', '/', '%', '+=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '==', '!=', '===', '!==', '>', '>=', '<', '<=', 'in'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    op = _ref[_i];
    prim[op] = binaryPr(op);
  }

  _ref2 = ['++', '--', 'typeof'];
  for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
    op = _ref2[_j];
    prim[op] = unaryPr(op);
  }

  _ref3 = ['+', '-', '!'];
  for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
    op = _ref3[_k];
    prim[op] = dualPr(op);
  }

  prepBranch = function(e) {
    if (e[0] && e[0] === ',,') {
      return e.slice(1);
    } else {
      return [e];
    }
  };

  isBrancher = function(e) {
    var _ref4;
    return e[0] && (_ref4 = e[0], __indexOf.call(branchers, _ref4) >= 0);
  };

  getSemi = function(e) {
    var _ref4;
    if (e[0] && (_ref4 = e[0], __indexOf.call(blockCreators, _ref4) >= 0)) {
      return '';
    } else {
      return ';';
    }
  };

  block = function(exprs, p) {
    var e, last, pre, res, _l, _len4;
    pre = exprs.slice(0, -1);
    last = exprs.slice(-1);
    res = '{\n';
    if (pre.length > 0) {
      for (_l = 0, _len4 = pre.length; _l < _len4; _l++) {
        e = pre[_l];
        res += toJs(e, '') + getSemi(e) + '\n';
      }
    }
    if (last.length === 1) {
      if (isBrancher(last[0])) {
        res += toJs(last[0], p) + getSemi(last[0]);
      } else if (p === '->') {
        res += toJs(['return', last[0]], p);
      } else {
        res += toJs(last[0], p) + getSemi(last[0]);
      }
    }
    return res + '\n}';
  };

  toJs = function(expr, p) {
    var e, exprKey, first, pair, pairs;
    if (p == null) p = '';
    if (typeof expr === 'string') {
      return expr;
    } else if (toStr.call(expr) === obArr) {
      first = expr[0];
      if (first) {
        if (prim[first]) {
          return prim[first](expr, p);
        } else {
          return toJs(first) + '(' + ((function() {
            var _l, _len4, _ref4, _results;
            _ref4 = expr.slice(1);
            _results = [];
            for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
              e = _ref4[_l];
              _results.push(toJs(e, first));
            }
            return _results;
          })()).join(', ') + ')';
        }
      } else {
        return '';
      }
    } else {
      exprKey = _.key(expr);
      if (exprKey === 's') {
        return '"' + expr.s + '"';
      } else if (exprKey === 'a') {
        return '[' + ((function() {
          var _l, _len4, _ref4, _results;
          _ref4 = expr.a;
          _results = [];
          for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
            e = _ref4[_l];
            _results.push(toJs(e, '[]'));
          }
          return _results;
        })()).join(', ') + ']';
      } else if (exprKey === 'o') {
        pairs = pairize(expr.o);
        return '{' + ((function() {
          var _l, _len4, _results;
          _results = [];
          for (_l = 0, _len4 = pairs.length; _l < _len4; _l++) {
            pair = pairs[_l];
            _results.push(toJs(pair[0], '{}') + ': ' + toJs(pair[1], '{}'));
          }
          return _results;
        })()).join(', ') + '}';
      } else {
        throw new Error('Unhandled case: ' + util.inspect(expr));
      }
    }
  };

  parse.parseFile('../tests/exprs.eth', function(err, data) {
    log(data);
    return fs.writeFile('../tests/exprs.js', block(data[0]).slice(2, -1), function(err) {
      if (err) {
        return console.log(err);
      } else {
        return console.log('saved');
      }
    });
  });

}).call(this);
