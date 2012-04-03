(function() {
  var eq, fs, log, parse, primitives, util;

  fs = require('fs');

  util = require('util');

  parse = require('./parse').parseFile;

  parse('exprs.eth', function(err, tree) {
    return log(tree);
  });

  eq = function(x, y) {
    return JSON.stringify(x) === JSON.stringify(y);
  };

  Array.prototype.put = Array.prototype.unshift;

  Array.prototype.take = Array.prototype.shift;

  log = function(n) {
    return console.log(util.inspect(n, false, null));
  };

  primitives = {
    '+': function(ps, env) {
      return '(' + ev(ps[0]) + ' + ' + ev(ps[1]) + ')';
    },
    '->': function(ps, env) {
      return '(function (' + trans(ps[0], env) + ') {  })';
    },
    'if': function(xs, env, ret) {
      if (ret == null) ret = false;
    }
  };

}).call(this);
