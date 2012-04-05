(function() {
  var applyAllSubs, applySub, args, ast, clump, clumpSeq, clumpTmpl, fs, log, splitByElip, subsFromPattern, substitute, toSeqs, _;

  fs = require('fs');

  _ = require('../src/utils.js');

  toSeqs = require('../src/toSeqs.js');

  args = process.argv.splice(2);

  log = _.log;

  ast = _.assert(args[0]);

  splitByElip = toSeqs.splitByElip;

  clump = toSeqs.clump;

  clumpSeq = toSeqs.clumpSeq;

  clumpTmpl = toSeqs.clumpTmpl;

  subsFromPattern = toSeqs.subsFromPattern;

  applySub = toSeqs.applySub;

  applyAllSubs = toSeqs.applyAllSubs;

  substitute = toSeqs.substitute;

}).call(this);
