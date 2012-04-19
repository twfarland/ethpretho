(function() {
  var fs, parse, root, treeToJs, util, _;

  root = this;

  _ = require('./utils.js');

  parse = require('./parse.js').parseFile;

  treeToJs = require('./toJs.js').treeToJs;

  fs = require('fs');

  util = require('util');

  parse('../tests/exprs.eth', function(err, parseTree) {
    return treeToJs.trans(parseTree, function(err, jsString) {
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
