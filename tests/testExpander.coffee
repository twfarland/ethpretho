fs     = require 'fs'
_      = require '../src/utils.js'
toSeqs = require '../src/toSeqs.js'

args = process.argv.splice 2

log = _.log
ast = _.assert args[0]
splitByElip = toSeqs.splitByElip
clump       = toSeqs.clump
clumpSeq    = toSeqs.clumpSeq
clumpTmpl   = toSeqs.clumpTmpl

log '--splitByElip'
ast splitByElip(['f', '...'], ['1','2','3']), [['f'], [], ['1','2','3'], []]
ast splitByElip(['f', '...', 'g'], ['1','2','3']), [['f'], ['g'], ['1','2'], ['3']]
ast splitByElip([['f', 'g'], '...'], [['1','2'],['2','3']]), [ [ [ 'f', 'g' ] ], [], [ [ '1', '2' ], [ '2', '3' ] ], [] ]


log '--clumpSeq - ok'
ast clumpSeq([['f'], ['1','2','3']], [[],[]]), [ [ { seq: [ 'f' ] } ], [ { seq: [ '1', '2', '3' ] } ] ]

ast clumpSeq([[['f']], [['1'],['2'],['3']]], [[],[]]), [ [ { seq: [ [ 'f' ] ] } ],
  [ { seq: [ [ '1' ], [ '2' ], [ '3' ] ] } ] ]

ast clumpSeq([[['f','g']], [['1','2'],['2','3'],['3','4']]], [[],[]]), [ [ { seq: [ [ 'f', 'g' ] ] } ],
  [ { seq: [ [ '1', '2' ], [ '2', '3' ], [ '3', '4' ] ] } ] ]
ast clumpSeq([[['f',['g']]], [['1',['2']],['2',['3']]]], [[],[]]), [ [ { seq: [ [ 'f', [ 'g' ] ] ] } ],
  [ { seq: [ [ '1', [ '2' ] ], [ '2', [ '3' ] ] ] } ] ]

ast clumpSeq([['f'], []], [[],[]]), [ [ { seq: [ 'f' ] } ], [ { seq: [] } ] ]


log '--clumpSeq - fail'
ast clumpSeq([['f'], ['1','2',['3']]], [[],[]]), false
ast clumpSeq([[['f','g']], [['1'],['2'],['3','4']]], [[],[]]), false
ast clumpSeq([[['f',['g']]], [['1',['2']],['2','3']]], [[],[]]), false

log '--clump - ok'
ast clump([ [], [] ], [[],[]]), [[],[]]

ast clump([ ['f'], ['1'] ], [[],[]]), [ [ 'f' ], [ '1' ] ]

ast clump([ ['f','g','h'], ['1','2','3'] ], [[],[]]), [ [ 'f', 'g', 'h' ], [ '1', '2', '3' ] ]


ast clump([ [['f']], [['1']] ], [[],[]]), [ [ [ 'f' ] ], [ [ '1' ] ] ]
ast clump([ [['f'], 'g'], [['1'], '2'] ], [[],[]]), [ [ [ 'f' ], 'g' ], [ [ '1' ], '2' ] ]
ast clump([ ['h', ['f', 'x'], 'g'], ['3', ['1', '4'], '2'] ], [[],[]]), [ [ 'h', [ 'f', 'x' ], 'g' ], [ '3', [ '1', '4' ], '2' ] ]


ast clump([['f', '...'], ['1','2','3']], [[],[]]), [ [ { seq: [ 'f' ] } ], [ { seq: [ '1', '2', '3' ] } ] ]
ast clump([['f', '...', 'g'], ['1','2','3']], [[],[]]), [ [ { seq: [ 'f' ] }, 'g' ], [ { seq: [ '1', '2' ] }, '3' ] ]
ast clump([['f', 'g', '...'], ['1','2','3']], [[],[]]), [ [ 'f', { seq: [ 'g' ] } ], [ '1', { seq: [ '2', '3' ] } ] ]


ast clump([[['f'], '...'], [['1'],['2'],['3']]], [[],[]]), [ [ { seq: [ [ 'f' ] ] } ],
  [ { seq: [ [ '1' ], [ '2' ], [ '3' ] ] } ] ]

ast clump([['f', '...'], []], [[],[]]), [ [ { seq: [ 'f' ] } ], [ { seq: [] } ] ]
ast clump([[['f'], '...'], []], [[],[]]), [ [ { seq: [ [ 'f' ] ] } ], [ { seq: [] } ] ]

ast clump([[['f'], '...', 'g'], [['1'], '4']], [[],[]]), [ [ { seq: [ [ 'f' ] ] }, 'g' ], [ { seq: [ [ '1' ] ] }, '4' ] ]

ast clump([['g', ['f'], '...'], ['1']], [[],[]]), [ [ 'g', { seq: [ [ 'f' ] ] } ], [ '1', { seq: [] } ] ]


ast clump([[['f', 'g'], '...'], [['1','2'],['2','3']]], [[],[]]), [ [ { seq: [ [ 'f', 'g' ] ] } ],
  [ { seq: [ [ '1', '2' ], [ '2', '3' ] ] } ] ]
ast clump([[['f', '...'], '...'], [['1','2'],['2']]], [[],[]]), [ [ { seq: [ [ { seq: [ 'f' ] } ] ] } ],
  [ { seq: [ [ { seq: [ '1', '2' ] } ], [ { seq: [ '2' ] } ] ] } ] ]

log '--clump - fail'
ast clump([ ['f'], [] ], [[],[]]), false
ast clump([ [], ['1'] ], [[],[]]), false
ast clump([ ['f'], ['1','2'] ], [[],[]]), false
ast clump([ ['f','g'], ['1'] ], [[],[]]), false

ast clump([ [['f']], [] ], [[],[]]), false
ast clump([ [['f']], ['1'] ], [[],[]]), false

log '--clumpTmpl - ok'
ast clumpTmpl([]), []
ast clumpTmpl(['f']), ['f']
ast clumpTmpl(['f','g','h']), ['f','g','h']
ast clumpTmpl(['f','...']), [{ seq: ['f'] }]
ast clumpTmpl([['f'],'...']), [{ seq: [['f']] }]
ast clumpTmpl([['f','g'],'...']), [{ seq: [['f','g']] }]
ast clumpTmpl(['h',['f','g'],'...','i']), ['h',{ seq: [['f','g']] },'i']
ast clumpTmpl([['f','...'],'...']), [{ seq: [[{ seq: ['f']}]] }]
ast clumpTmpl([['f','...','g'],'...','h']), [{ seq: [[{ seq: ['f']}, 'g']] }, 'h']