(function() {
  var append2d, applyAllSubs, applySub, clump, clumpExpr, clumpSeq, clumpTmpl, root, splitByElip, subsFromPattern, substitute, toString, _;

  root = this;

  _ = require('./utils.js');

  toString = {}.toString;

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
    } else if (toString.call(pattern[0]) === '[object Array]') {
      if (toString.call(source[0]) === '[object Array]') {
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
    while (tmpl.length !== 0) {
      if (tmpl[1] && (tmpl[1] === '...')) {
        seqs.push({
          seq: clumpTmpl([tmpl[0]])
        });
        tmpl.splice(0, 2);
      } else if (typeof tmpl[0] === 'string') {
        seqs.push(tmpl[0]);
        tmpl.splice(0, 1);
      } else if (toString.call(tmpl[0]) === '[object Array]') {
        seqs.push(clumpTmpl(tmpl[0]));
        tmpl.splice(0, 1);
      } else {
        throw new Error('clumpTmpl failed on pattern:\n' + JSON.stringify(tmpl));
      }
    }
    return seqs;
  };

  subsFromPattern = function(pattern, source) {
    var subs;
    subs = [];
    while (pattern.length !== 0) {
      if (toString.call(pattern[0]) === '[object Array]') {
        subs = subs.concat(subsFromPattern(pattern[0], source[0]));
      } else {
        subs.push({
          from: pattern[0],
          to: source[0]
        });
      }
      pattern.splice(0, 1);
      source.splice(0, 1);
    }
    if (source.length === 0) {
      return subs;
    } else {
      return false;
    }
  };

  applySub = function(onMatch) {
    return function(sub, tmpl, newTmpl) {
      var e;
      if (newTmpl == null) newTmpl = [];
      while (tmpl.length !== 0) {
        e = tmpl[0];
        if (toString.call(e) === '[object Array]') {
          newTmpl.push(applySub(onMatch)(sub, e));
        } else if (_.eq(sub.from, e)) {
          newTmpl.push(onMatch(sub, e));
        } else {
          newTmpl.push(e);
        }
        tmpl.splice(0, 1);
      }
      return newTmpl;
    };
  };

  applyAllSubs = function(onMatch, subs, tmpl) {
    var sub, _i, _len;
    for (_i = 0, _len = subs.length; _i < _len; _i++) {
      sub = subs[_i];
      tmpl = applySub(onMatch)(sub, tmpl);
    }
    return tmpl;
  };

  substitute = function(pattern, source, tmpl, envSubs) {
    var envMatch, pattSrcMatch, pattSubs;
    pattSubs = subsFromPattern(pattern, source);
    envMatch = function(sub, e) {
      return {
        from: sub.from,
        to: sub.from + '_'
      };
    };
    pattSrcMatch = function(sub, e) {
      return sub;
    };
    return applyAllSubs(pattSrcMatch, pattSubs, applyAllSubs(envMatch, envSubs, tmpl));
  };

  root.clump = clump;

  root.clumpExpr = clumpExpr;

  root.clumpSeq = clumpSeq;

  root.append2d = append2d;

  root.splitByElip = splitByElip;

  root.clumpTmpl = clumpTmpl;

  root.subsFromPattern = subsFromPattern;

  root.applySub = applySub;

  root.applyAllSubs = applyAllSubs;

  root.substitute = substitute;

}).call(this);
