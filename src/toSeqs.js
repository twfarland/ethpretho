(function() {
  var append2d, clump, clumpExpr, clumpSeq, clumpTmpl, root, splitByElip;

  root = this;

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
      throw new Error('clump failed on pattern:\n' + JSON.stringify(patternSource));
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

  clumpTmpl = function(tmpl, seqs) {
    if (seqs == null) seqs = [];
    if (tmpl.length === 0) {
      return seqs;
    } else if (tmpl[1] && (tmpl[1] === '...')) {
      return clumpTmpl(tmpl.slice(2), seqs.concat([
        {
          seq: clumpTmpl([tmpl[0]], [])
        }
      ]));
    } else if (typeof tmpl[0] === 'string') {
      return clumpTmpl(tmpl.slice(1), seqs.concat([tmpl[0]]));
    } else if ({}.toString.call(tmpl[0]) === '[object Array]') {
      return clumpTmpl(tmpl.slice(1), seqs.concat([clumpTmpl(tmpl[0], [])]));
    } else {
      throw new Error('clumpTmpl failed on pattern:\n' + JSON.stringify(tmpl));
    }
  };

  root.clump = clump;

  root.clumpExpr = clumpExpr;

  root.clumpSeq = clumpSeq;

  root.append2d = append2d;

  root.splitByElip = splitByElip;

  root.clumpTmpl = clumpTmpl;

}).call(this);
