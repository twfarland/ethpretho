(function() {
  var extendBindings, log, root, startsScope, subst, toString, _;

  root = this;

  _ = require('./utils.js');

  subst = require('./toSeqs.js');

  toString = {}.toString;

  log = _.log;

  startsScope = function(expr) {
    var first;
    first = expr[0];
    if (first) {
      if (first === '->') {
        return [expr[1], expr.slice(2)];
      } else if (((first === '=') || (first === ':=')) && expr[1] && (toString.call(expr[1]) === '[object Array]')) {
        return [expr[1].slice(1), expr.slice(2)];
      } else {
        return false;
      }
    } else {
      return false;
    }
  };

  extendBindings = function(env, expr) {
    if (startsScope(expr)) return true;
  };

  log(startsScope(['->', ['x'], ['*', 'x', '2']]));

  log(startsScope(['=', ['dub', 'x'], ['*', 'x', '2']]));

  log(startsScope([':=', ['dub', 'x'], ['*', 'x', '2']]));

  log(startsScope([':=', 'x', '1']));

  log(startsScope([]));

}).call(this);
