(function() {
  var _;

  _ = require('../help.js');

  _.isComment.exec('; wrwtew') !== null;

  _.isComment.exec('; wrwtew\n wfewf') !== null;

  _.isComment.exec('  ; wrwtew') === null;

  _.isComment.exec('"wat"') === null;

  _.isComment.exec('(') === null;

  _.isSpace.exec('  ') !== null;

  _.isSpace.exec('sp  ') === null;

  _.isSpace.exec('\n sp') !== null;

  _.isSpace.exec('\n\n\n sp') !== null;

  _.isAtom.exec('  ') === null;

  _.isAtom.exec('sp  ') !== null;

  _.isAtom.exec('\n sp') === null;

  _.isAtom.exec('\n\n\n sp') === null;

  _.isAtom.exec(';wat') === null;

  _.isAtom.exec('"wat"') === null;

  _.isStr.exec('wat  ') === null;

  _.isStr.exec('"wat ') === null;

  _.isStr.exec(' "wat"') === null;

  _.isStr.exec('"wat \"w\" wer" ') !== null;

  _.isStr.exec(';wat ') === null;

  _.isStr.exec('   ') === null;

  _.isStr.exec('\n "wat"') === null;

  _.isStr.exec('"a"') !== null;

}).call(this);
