(function() {
  var append2d, clump, clumpExpr, clumpSeq, eq, fs, log, parse, splitByElip, util;

  fs = require('fs');

  util = require('util');

  parse = require('./parse').parseFile;

  eq = function(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  };

  Array.prototype.put = Array.prototype.unshift;

  Array.prototype.take = Array.prototype.shift;

  log = function(n) {
    return console.log(util.inspect(n, false, null));
  };

  clump = function(patternSource, clumped) {
    var pRest, pSeq, pattern, sRest, sSeq, source, _ref;
    pattern = patternSource[0];
    source = patternSource[1];
    if (pattern.length === 0) {
      if (source.length === 0) {
        return clumped;
      } else {
        return false;
      }
    } else if (pattern[1] && (pattern[1] === '...')) {
      _ref = splitByElip(pattern, source), pSeq = _ref[0], pRest = _ref[1], sSeq = _ref[2], sRest = _ref[3];
      return clump([pRest, sRest], append2d(clumped, clumpSeq([pSeq, sSeq], [[], []])));
    } else if (source.length === 0) {
      return false;
    } else if (typeof pattern[0] === 'string') {
      if (typeof source[0] === 'string') {
        return clump([pattern.slice(1), source.slice(1)], append2d(clumped, [[pattern[0]], [source[0]]]));
      } else {
        return false;
      }
    } else if ({}.toString.call(pattern[0]) === '[object Array]') {
      if ({}.toString.call(source[0]) === '[object Array]') {
        return clump([pattern.slice(1), source.slice(1)], append2d(clumped, clumpExpr(pattern[0], source[0])));
      } else {
        return false;
      }
    } else {
      throw new Error('Unhandled case');
    }
  };

  clumpExpr = function(pattern, source) {
    var cPattern, cSource, _ref;
    _ref = clump([pattern, source], [[], []]), cPattern = _ref[0], cSource = _ref[1];
    return [[cPattern], [cSource]];
  };

  clumpSeq = function(seqs, clumped) {
    var pClumped, pSeq, s, sClump, sClumped, sSeq, _i, _len;
    pSeq = seqs[0];
    sSeq = seqs[1];
    pClumped = seqs[0];
    sClumped = [];
    for (_i = 0, _len = sSeq.length; _i < _len; _i++) {
      s = sSeq[_i];
      sClump = clump([pSeq, [s]], [[], []]);
      if (sClump && sClump[0][0]) {
        pClumped = sClump[0];
        sClumped = sClumped.concat(sClump[1]);
      } else {
        return false;
      }
    }
    return [
      [
        {
          seq: pClumped
        }
      ], [
        {
          seq: sClumped
        }
      ]
    ];
  };

  append2d = function(xs, ys) {
    if (!(xs || ys)) {
      return false;
    } else {
      return [xs[0].concat(ys[0]), xs[1].concat(ys[1])];
    }
  };

  splitByElip = function(pattern, source) {
    var pRest, pSeq, sRest, sSeq;
    pSeq = [pattern[0]];
    pRest = pattern.slice(2);
    sSeq = source.slice(0, (source.length - pRest.length - 1) + 1 || 9e9);
    sRest = source.slice(source.length - pRest.length);
    return [pSeq, pRest, sSeq, sRest];
  };

  log('--splitByElip');

  log(splitByElip(['f', '...'], ['1', '2', '3']));

  log(splitByElip(['f', '...', 'g'], ['1', '2', '3']));

  log(splitByElip([['f', 'g'], '...'], [['1', '2'], ['2', '3']]));

  log('--clumpSeq - ok');

  log(clumpSeq([['f'], ['1', '2', '3']], [[], []]));

  log(clumpSeq([[['f']], [['1'], ['2'], ['3']]], [[], []]));

  log(clumpSeq([[['f', 'g']], [['1', '2'], ['2', '3'], ['3', '4']]], [[], []]));

  log(clumpSeq([[['f', ['g']]], [['1', ['2']], ['2', ['3']]]], [[], []]));

  log(clumpSeq([['f'], []], [[], []]));

  log('--clumpSeq - fail');

  log(clumpSeq([['f'], ['1', '2', ['3']]], [[], []]));

  log(clumpSeq([[['f', 'g']], [['1'], ['2'], ['3', '4']]], [[], []]));

  log(clumpSeq([[['f', ['g']]], [['1', ['2']], ['2', '3']]], [[], []]));

  log('--clump - ok');

  log(clump([[], []], [[], []]));

  log(clump([['f'], ['1']], [[], []]));

  log(clump([['f', 'g', 'h'], ['1', '2', '3']], [[], []]));

  log(clump([[['f']], [['1']]], [[], []]));

  log(clump([[['f'], 'g'], [['1'], '2']], [[], []]));

  log(clump([['h', ['f', 'x'], 'g'], ['3', ['1', '4'], '2']], [[], []]));

  log(clump([['f', '...'], ['1', '2', '3']], [[], []]));

  log(clump([['f', '...', 'g'], ['1', '2', '3']], [[], []]));

  log(clump([['f', 'g', '...'], ['1', '2', '3']], [[], []]));

  log(clump([[['f'], '...'], [['1'], ['2'], ['3']]], [[], []]));

  log(clump([['f', '...'], []], [[], []]));

  log(clump([[['f'], '...'], []], [[], []]));

  log(clump([[['f'], '...', 'g'], [['1'], '4']], [[], []]));

  log(clump([['g', ['f'], '...'], ['1']], [[], []]));

  log(clump([[['f', 'g'], '...'], [['1', '2'], ['2', '3']]], [[], []]));

  log(clump([[['f', '...'], '...'], [['1', '2'], ['2']]], [[], []]));

  log('--clump - fail');

  log(clump([['f'], []], [[], []]));

  log(clump([[], ['1']], [[], []]));

  log(clump([['f'], ['1', '2']], [[], []]));

  log(clump([['f', 'g'], ['1']], [[], []]));

  log(clump([[['f']], []], [[], []]));

  log(clump([[['f']], ['1']], [[], []]));

}).call(this);
