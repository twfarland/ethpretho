(function() {
  var _;

  _ = require('../src/help.js');

  console.log(_.isComment.exec('; wrwtew') !== null, _.isComment.exec('; wrwtew\n wfewf') !== null, _.isComment.exec('  ; wrwtew') === null, _.isComment.exec('"wat"') === null, _.isComment.exec('(') === null, _.isSpace.exec('  ') !== null, _.isSpace.exec('sp  ') === null, _.isSpace.exec('\n sp') !== null, _.isSpace.exec('\n\n\n sp') !== null, _.isAtom.exec('  ') === null, _.isAtom.exec('sp  ') !== null, _.isAtom.exec('\n sp') === null, _.isAtom.exec('\n\n\n sp') === null, _.isAtom.exec(';wat') === null, _.isAtom.exec('"wat"') === null, _.isStr.exec('wat  ') === null, _.isStr.exec('"wat ') === null, _.isStr.exec(' "wat"') === null, _.isStr.exec('"wat \"w\" wer" ') !== null, _.isStr.exec(';wat ') === null, _.isStr.exec('   ') === null, _.isStr.exec('\n "wat"') === null, _.isStr.exec('"a"') !== null, _.isStr.exec('"./help.js"\n                ))\n(:= obArr "[object Array]"\n  )')[0] === '"./help.js"', _.isRegex.exec('/^\/([^\\]*?|(\\.))*?\/[img]*/g') !== null, _.isRegex.exec('/^\"(([^\\]*?|(\\.))*?)\"/') !== null, _.isRegex.exec('/wat(') === null, _.isRegex.exec('  wat') === null, _.isRegex.exec('wat') === null);

}).call(this);
