(function() {
  var fs, isInt, isSymbol, log, obArr, obObj, parse, root, toStr, treeToJs, util, _,
    __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = this;

  _ = require('./utils.js');

  parse = require('./parse.js');

  fs = require('fs');

  util = require('util');

  toStr = {}.toString;

  obArr = '[object Array]';

  obObj = '[object Object]';

  log = _.log;

  isInt = /\d+/;

  isSymbol = /^[\_|\|$A-z][\_|\|$A-z|\d]*/;

  treeToJs = function(extra) {
    var argBlock, binaryPr, block, blockCreators, branchers, dualPr, e, getIndent, getRef, getSemi, isBrancher, noWrap, op, pairize, prepBranch, prim, toJs, unaryPost, unaryPr, wrap, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref, _ref2, _ref3, _ref4;
    getIndent = function(i) {
      var res;
      res = '';
      while (!(i < 1)) {
        res += '    ';
        i--;
      }
      return res;
    };
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
    branchers = ['if', 'switch', 'try'];
    blockCreators = branchers.concat(['for', 'while']);
    noWrap = ['', '=', '()', 'return'];
    isBrancher = function(e) {
      var _ref;
      return e[0] && (_ref = e[0], __indexOf.call(branchers, _ref) >= 0);
    };
    prepBranch = function(e) {
      if (e[0] && (e[0] === ',')) {
        return e.slice(1);
      } else {
        return [e];
      }
    };
    getSemi = function(e) {
      var _ref;
      if ((e[0] && (_ref = e[0], __indexOf.call(blockCreators, _ref) >= 0)) || e.c) {
        return '';
      } else {
        return ';';
      }
    };
    argBlock = function(exprs, p, i) {
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
        })()).join(', ') + ')';
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
    prim = {
      ':=': function(e, p, i) {
        if (e.length > 2) {
          return 'var ' + prim['='](e, p, i);
        } else {
          return 'var ' + e[1];
        }
      },
      '=': function(e, p, i) {
        if (toStr.call(e[1]) === obArr) {
          return toJs(e[1][0], '=', i) + ' = ' + toJs(['->', e[1].slice(1)].concat(e.slice(2)), '=', i);
        } else {
          return toJs(e[1], '=', i) + ' = ' + toJs(e[2], '=', i);
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
      'return': function(e, p, i) {
        return 'return ' + toJs(e[1], 'return', i);
      },
      '?': function(e, p, i) {
        return wrap(toJs(e[1], '()', i) + ' ? ' + toJs(e[2], '()', i) + ' : ' + toJs(e[3], '()', i), p);
      },
      'if': function(e, p, i) {
        var prd, res;
        if (p === '->' || p === '') {
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
      'switch': function(e, p, i) {
        var match, prd, res;
        res = ['if'];
        match = e[1];
        prd = e.slice(2);
        while (prd.length !== 0) {
          if (prd.length === 1) {
            res.push(prd[0]);
            prd.splice(0, 1);
          } else {
            res = res.concat([['===', match, prd[0]], prd[1]]);
            prd.splice(0, 2);
          }
        }
        return toJs(res, p, i);
      },
      'try': function(e, p, i) {
        var res;
        if (p === '->' || p === '') {
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
      'while': function(e, p, i) {},
      'for': function(e, p, i) {
        var e_, last, pre;
        if (p === '->' || p === '') {
          return 'for (' + ((function() {
            var _i, _len, _ref, _results;
            _ref = e[1];
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              e_ = _ref[_i];
              _results.push(toJs(e_, '', i));
            }
            return _results;
          })()).join('; ') + ') ' + block(e.slice(2), '', i);
        } else {
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
          ], p, i), 'for');
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
    unaryPost = function(sym) {
      return function(e, p, i) {
        if (p === '') {
          return wrap(e[1] + sym, p);
        } else {
          return wrap(e[1] + sym + ', ' + e[1], p);
        }
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
    dualPr = function(sym) {
      return function(e, p, i) {
        var e_;
        if (e.length === 2) {
          return wrap(sym + e[1], p);
        } else {
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
        }
      };
    };
    _ref = ['*', '/', '%', '+=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=', '==', '!=', '===', '!==', '>', '>=', '<', '<=', 'in', 'of', 'instanceof', '&&', '||', ','];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      op = _ref[_i];
      prim[op] = binaryPr(op);
    }
    _ref2 = ['++', '--'];
    for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
      op = _ref2[_j];
      prim[op] = unaryPost(op);
    }
    _ref3 = ['typeof', 'new', 'throw', '!'];
    for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
      op = _ref3[_k];
      prim[op] = unaryPr(op);
    }
    _ref4 = ['+', '-'];
    for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
      op = _ref4[_l];
      prim[op] = dualPr(op);
    }
    for (_m = 0, _len5 = extra.length; _m < _len5; _m++) {
      e = extra[_m];
      prim[e] = extra[e];
    }
    block = function(exprs, p, i) {
      var e, i_, ind, last, pre, res, _len6, _n;
      if (i == null) i = 0;
      pre = exprs.slice(0, -1);
      last = exprs.slice(-1);
      ind = getIndent(i);
      i_ = i + 1;
      res = '{\n';
      if (pre.length > 0) {
        for (_n = 0, _len6 = pre.length; _n < _len6; _n++) {
          e = pre[_n];
          res += ind + toJs(e, '', i_) + getSemi(e) + '\n';
        }
      }
      if (last.length === 1) {
        res += ind;
        e = last[0];
        if (isBrancher(e)) {
          res += toJs(e, p, i_) + getSemi(e);
        } else if (p === '->') {
          res += (toJs(['return', e], p, i_)) + getSemi(e);
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
            var _len6, _n, _ref5, _results;
            _ref5 = expr.a;
            _results = [];
            for (_n = 0, _len6 = _ref5.length; _n < _len6; _n++) {
              e = _ref5[_n];
              _results.push(toJs(e, '[]', i));
            }
            return _results;
          })()).join(', ') + ']';
        } else if (exprKey === 'o') {
          pairs = pairize(expr.o);
          return '{' + ((function() {
            var _len6, _n, _results;
            _results = [];
            for (_n = 0, _len6 = pairs.length; _n < _len6; _n++) {
              pair = pairs[_n];
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

  parse.parseFile('../tests/exprs.eth', function(err, parseTree) {
    return root.treeToJs.trans(parseTree, function(err, jsString) {
      return fs.writeFile('../tests/exprs.js', jsString, function(err) {
        if (err) {
          return console.log(err);
        } else {
          return console.log('saved');
        }
      });
    });
  });

}).call(this);
