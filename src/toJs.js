(function() {
  var each, fs, isIn, isInt, isSymbol, log, map, obArr, obObj, pairize, parse, partition, root, toStr, treeToJs, util, _,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _ = require('./help.js');

  parse = require('./parse.js');

  fs = require('fs');

  util = require('util');

  root = this;

  toStr = _.toStr;

  obArr = _.obArr;

  obObj = _.obObj;

  log = _.log;

  isInt = _.isInt;

  isSymbol = _.isSymbol;

  pairize = _.pairize;

  partition = _.partition;

  isIn = _.isIn;

  map = _.map;

  each = _.each;

  treeToJs = function(extra) {
    var argBlock, binaryAlwaysWrap, binaryChain, binaryPr, block, blockCreators, branchers, getIndent, getRef, getSemi, iniBlock, isBlockCreator, isBrancher, isFirstIn, k, noWrap, openSpace, placePrim, prepBranch, prim, sBlock, selfCollect, toJs, unaryPost, unaryPr, v, wrap;
    extra = extra || {};
    branchers = ['if', 'switch', 'try'];
    blockCreators = branchers.concat(['for', 'while']);
    noWrap = ['', '=', '()', 'return', 'throw', 'new', 'for'];
    openSpace = ['->', ''];
    isFirstIn = function(set) {
      return function(e) {
        var _ref;
        return e[0] && (_ref = e[0], __indexOf.call(set, _ref) >= 0);
      };
    };
    isBrancher = isFirstIn(branchers);
    isBlockCreator = isFirstIn(blockCreators);
    sBlock = function(sep) {
      return function(exprs, p, i) {
        var e;
        if (exprs.length === 0) {
          return '()';
        } else {
          return '(' + ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = exprs.length; _i < _len; _i++) {
              e = exprs[_i];
              _results.push(toJs(e, '()', i));
            }
            return _results;
          })()).join(sep) + ')';
        }
      };
    };
    argBlock = sBlock(', ');
    iniBlock = sBlock('; ');
    prepBranch = function(e) {
      if (e[0] && (e[0] === ',')) {
        return e.slice(1);
      } else {
        return [e];
      }
    };
    getIndent = function(i) {
      var res;
      res = '';
      while (!(i < 1)) {
        res += '    ';
        i--;
      }
      return res;
    };
    getSemi = function(e) {
      if (isBlockCreator(e) || e.c) {
        return '';
      } else {
        return ';';
      }
    };
    getRef = function(e, i) {
      if ((typeof e === 'string') && isSymbol.exec(e)) {
        return '.' + e;
      } else if ((toStr.call(e) === obObj) && (_.key(e) === 'a')) {
        return '[' + toJs(e.a[0], '.', i) + ']';
      } else {
        return '[' + toJs(e, '.', i) + ']';
      }
    };
    wrap = function(res, p) {
      if (__indexOf.call(noWrap, p) >= 0) {
        return res;
      } else {
        return '(' + res + ')';
      }
    };
    selfCollect = function(e, p, i) {
      var last, pre;
      pre = e.slice(0, -1);
      last = e.slice(-1);
      return wrap(toJs([
        [
          '->', [], [
            ':=', 'res_', {
              a: []
            }
          ], pre.concat([['res_.push', last[0]]]), 'res_'
        ]
      ], p, i), e[0]);
    };
    prim = {
      'rgx': function(e, p, i) {
        return '/' + toJs(e[1], 'rgx', i) + '/' + toJs(e[2], 'rgx', i);
      },
      ':=': function(e, p, i) {
        if (e.length > 2) {
          return 'var ' + prim['='](e, p, i);
        } else {
          return 'var ' + e[1];
        }
      },
      '=': function(e, p, i) {
        var pair, pairs;
        if (!e[2]) {
          return toJs(e[1], '=', i);
        } else {
          pairs = pairize(e.slice(1));
          return ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = pairs.length; _i < _len; _i++) {
              pair = pairs[_i];
              _results.push(toJs(pair[0], '=', i) + ' = ' + toJs(pair[1], '=', i));
            }
            return _results;
          })()).join(',\n' + getIndent(i));
        }
      },
      '.': function(e, p, i) {
        var mem, part, parts, res, _i, _len;
        mem = e[1];
        res = toJs(mem, '.', i);
        parts = e.slice(2);
        for (_i = 0, _len = parts.length; _i < _len; _i++) {
          part = parts[_i];
          if (typeof part === 'string') {
            res += getRef(part, i);
          } else if (toStr.call(part) === obArr) {
            if (prim[part[0]]) {
              res += '[' + prim[part[0]](part, '.', i) + ']';
            } else {
              res += getRef(part[0], i) + argBlock(part.slice(1), '.', i);
            }
          } else if (toStr.call(part) === obObj) {
            if (_.key(part) === 's') res += '["' + part.s + '"]';
            if (_.key(part) === 'a') {
              if (part.a.length === 2) {
                res += '.slice' + argBlock(part.a.slice(0, 2), 'slice', i);
              } else {
                res += '[' + toJs(part.a[0], '.', i) + ']';
              }
            }
          } else {
            throw new Error('Invalid reference');
          }
        }
        return res;
      },
      '->': function(e, p, i) {
        var res;
        res = 'function (' + e[1].join(', ') + ') ' + block(e.slice(2), '->', i);
        if (p === '') {
          return '(' + res + ')';
        } else {
          return wrap(res, p);
        }
      },
      'throw': function(e, p, i) {
        return 'throw ' + toJs(e[1], 'throw', i);
      },
      'return': function(e, p, i) {
        return 'return ' + toJs(e[1], 'return', i);
      },
      '?': function(e, p, i) {
        return wrap(toJs(e[1], '()', i) + ' ? ' + toJs(e[2], '()', i) + ' : ' + toJs(e[3], '()', i), p);
      },
      'if': function(e, p, i) {
        var prd, res;
        if (__indexOf.call(openSpace, p) >= 0) {
          prd = e.slice(1);
          res = 'if (' + toJs(prd[0], '()', i) + ') ' + block(prepBranch(prd[1]), p, i);
          prd.splice(0, 2);
          while (prd.length !== 0) {
            if (prd.length === 1) {
              res += ' else ' + block(prepBranch(prd[0]), p, i);
              prd.splice(0, 1);
            } else {
              res += ' else if (' + toJs(prd[0], '()', i) + ') ' + block(prepBranch(prd[1]), p, i);
              prd.splice(0, 2);
            }
          }
          return res;
        } else {
          if (e.length === 4) {
            return toJs(['?'].concat(e.slice(1)), p, i);
          } else {
            return wrap(toJs([['->', [], e]], p, i), 'if');
          }
        }
      },
      'try': function(e, p, i) {
        var res;
        if (__indexOf.call(openSpace, p) >= 0) {
          res = 'try ' + block(prepBranch(e[2]), p, i);
          if (e[3]) {
            res += ' catch (' + toJs(e[1], '()', i) + ') ' + block(prepBranch(e[3]), p, i);
          }
          if (e[4]) res += ' finally ' + block(prepBranch(e[4]), p, i);
          return res;
        } else {
          return wrap(toJs([['->', [], e]], p, i), 'try');
        }
      },
      'while': function(e, p, i) {
        if (__indexOf.call(openSpace, p) >= 0) {
          return 'while ' + iniBlock([e[1]], 'while', i) + ' ' + block(e.slice(2), '', i);
        } else {
          return selfCollect(e, p, i);
        }
      },
      'for': function(e, p, i) {
        if (__indexOf.call(openSpace, p) >= 0) {
          return 'for ' + iniBlock(e[1], 'for', i) + ' ' + block(e.slice(2), '', i);
        } else {
          return selfCollect(e, p, i);
        }
      }
    };
    binaryPr = function(sym) {
      return function(e, p, i) {
        var e_;
        return wrap(((function() {
          var _i, _len, _ref, _results;
          _ref = e.slice(1);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            _results.push(toJs(e_, sym, i));
          }
          return _results;
        })()).join(' ' + sym + ' '), p);
      };
    };
    binaryAlwaysWrap = function(sym) {
      return function(e, p, i) {
        var e_;
        return wrap(((function() {
          var _i, _len, _ref, _results;
          _ref = e.slice(1);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            _results.push(toJs(e_, sym, i));
          }
          return _results;
        })()).join(' ' + sym + ' '), 'wrap');
      };
    };
    binaryChain = function(sym) {
      return function(e, p, i) {
        var e_, left, res, _i, _len, _ref;
        if (e.length > 3) {
          left = e[1];
          res = ['&&'];
          _ref = e.slice(2);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e_ = _ref[_i];
            res.push([sym, left, e_]);
            left = e_;
          }
          return toJs(res, p, i);
        } else {
          return wrap(toJs(e[1], sym, i) + ' ' + sym + ' ' + toJs(e[2], sym, i), p);
        }
      };
    };
    unaryPost = function(sym) {
      return function(e, p, i) {
        return wrap(e[1] + sym, p);
      };
    };
    unaryPr = function(sym) {
      return function(e, p, i) {
        var arg;
        if (e.length < 3) {
          arg = e[1];
        } else {
          arg = e.slice(1);
        }
        return wrap(sym + ' ' + toJs(arg, p, i), p);
      };
    };
    placePrim = function(func, ls) {
      var op, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = ls.length; _i < _len; _i++) {
        op = ls[_i];
        _results.push(prim[op] = func(op));
      }
      return _results;
    };
    placePrim(binaryPr, ["+=", "*=", "/=", "%=", "-=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]);
    placePrim(binaryAlwaysWrap, ["*", "/", "%", "+", "-", "&&", "||", ","]);
    placePrim(binaryChain, ["==", "!=", "===", "!==", ">", ">=", "<", "<=", "in", "of", "instanceof"]);
    placePrim(unaryPost, ["++", "--"]);
    placePrim(unaryPr, ["typeof", "new", "throw", "!"]);
    for (k in extra) {
      v = extra[k];
      prim[k] = v;
    }
    block = function(exprs, p, i) {
      var e, i_, ind, last, pre, res, _i, _len;
      if (i == null) i = 0;
      pre = exprs.slice(0, -1);
      last = exprs.slice(-1);
      ind = getIndent(i);
      i_ = i + 1;
      res = '{\n';
      if (pre.length > 0) {
        for (_i = 0, _len = pre.length; _i < _len; _i++) {
          e = pre[_i];
          res += ind + toJs(e, '', i_) + getSemi(e) + '\n';
        }
      }
      if (last.length === 1) {
        res += ind;
        e = last[0];
        if (isBrancher(e)) {
          res += toJs(e, p, i_) + getSemi(e);
        } else if (p === '->') {
          if (e[0] && e[0] === 'throw') {
            res += 'throw ' + (toJs(e[1], 'throw', i_)) + getSemi(e);
          } else {
            res += (toJs(['return', e], p, i_)) + getSemi(e);
          }
        } else {
          res += toJs(e, p, i_) + getSemi(e);
        }
      }
      return res + '\n' + getIndent(i - 1) + '}';
    };
    toJs = function(expr, p, i) {
      var e, exprKey, first, pair, pairs;
      if (p == null) p = '';
      if (typeof expr === 'string') {
        return expr;
      } else if (toStr.call(expr) === obArr) {
        first = expr[0];
        if (first) {
          if (prim[first]) {
            return prim[first](expr, p, i);
          } else {
            return toJs(first, '', i) + argBlock(expr.slice(1), first, i);
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
            var _i, _len, _ref, _results;
            _ref = expr.a;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              e = _ref[_i];
              _results.push(toJs(e, '[]', i));
            }
            return _results;
          })()).join(', ') + ']';
        } else if (exprKey === 'o') {
          pairs = pairize(expr.o);
          return '{' + ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = pairs.length; _i < _len; _i++) {
              pair = pairs[_i];
              _results.push(toJs(pair[0], '{}', i) + ': ' + toJs(pair[1], '{}', i));
            }
            return _results;
          })()).join(', ') + '}';
        } else if (exprKey === 'c') {
          return '//' + expr.c;
        } else {
          throw new Error('Unhandled case: ' + util.inspect(expr));
        }
      }
    };
    this.toJs = toJs;
    this.block = block;
    this.trans = function(tree, callback) {
      return callback(null, block(tree[0], '', 0).slice(2, -1));
    };
    return this;
  };

  root.treeToJs = new treeToJs();

}).call(this);
