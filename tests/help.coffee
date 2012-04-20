_  = require '../help.js'

_.isComment.exec('; wrwtew') isnt null
_.isComment.exec('; wrwtew\n wfewf') isnt null
_.isComment.exec('  ; wrwtew') is null
_.isComment.exec('"wat"') is null
_.isComment.exec('(') is null
_.isSpace.exec('  ') isnt null
_.isSpace.exec('sp  ') is null
_.isSpace.exec('\n sp') isnt null
_.isSpace.exec('\n\n\n sp') isnt null
_.isAtom.exec('  ') is null
_.isAtom.exec('sp  ') isnt null
_.isAtom.exec('\n sp') is null
_.isAtom.exec('\n\n\n sp') is null
_.isAtom.exec(';wat') is null
_.isAtom.exec('"wat"') is null
_.isStr.exec('wat  ') is null
_.isStr.exec('"wat ') is null
_.isStr.exec(' "wat"') is null
_.isStr.exec('"wat \"w\" wer" ') isnt null
_.isStr.exec(';wat ') is null
_.isStr.exec('   ') is null
_.isStr.exec('\n "wat"') is null
_.isStr.exec('"a"') isnt null
