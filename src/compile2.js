(function() {
  var args, compile, fs, parse, root, treeToJs;

  fs = require('fs');

  parse = require('./parse.js').parseFile;

  treeToJs = require('./toJs2.js').treeToJs;

  root = this;

  args = process.argv;

  compile = function(file) {
    return parse(file, function(err, parseTree) {
      return treeToJs.trans(parseTree, function(err, jsString) {
        return fs.writeFile(file.split('.eth')[0] + '.js', jsString, function(err) {
          if (err) {
            return console.log(err);
          } else {
            return console.log('Compiled ' + file);
          }
        });
      });
    });
  };

  root.compile = compile;

  if (args[2]) compile(args[2]);

}).call(this);
