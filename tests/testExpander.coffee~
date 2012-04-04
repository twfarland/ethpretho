fs = require 'fs'
util = require 'util'
parse = require('./parse').parseFile


eq  = (x,y) -> JSON.stringify(x) is JSON.stringify(y)
Array::put = Array::unshift
Array::take = Array::shift

log = (n) ->
        console.log util.inspect n, false, null


log '--splitByElip'
log splitByElip ['f', '...'], ['1','2','3'] # [['f'], [], ['1','2','3'], []]
log splitByElip ['f', '...', 'g'], ['1','2','3'] # [['f'], ['g'], ['1','2'], ['3']]
log splitByElip [['f', 'g'], '...'], [['1','2'],['2','3']]

log '--clumpSeq - ok'
log clumpSeq [['f'], ['1','2','3']], [[],[]]
log clumpSeq [[['f']], [['1'],['2'],['3']]], [[],[]]
log clumpSeq [[['f','g']], [['1','2'],['2','3'],['3','4']]], [[],[]]
log clumpSeq [[['f',['g']]], [['1',['2']],['2',['3']]]], [[],[]]
log clumpSeq [['f'], []], [[],[]]

log '--clumpSeq - fail'
log clumpSeq [['f'], ['1','2',['3']]], [[],[]]
log clumpSeq [[['f','g']], [['1'],['2'],['3','4']]], [[],[]]
log clumpSeq [[['f',['g']]], [['1',['2']],['2','3']]], [[],[]]

log '--clump - ok'
log clump [ [], [] ], [[],[]]

log clump [ ['f'], ['1'] ], [[],[]]
log clump [ ['f','g','h'], ['1','2','3'] ], [[],[]]

log clump [ [['f']], [['1']] ], [[],[]]
log clump [ [['f'], 'g'], [['1'], '2'] ], [[],[]]
log clump [ ['h', ['f', 'x'], 'g'], ['3', ['1', '4'], '2'] ], [[],[]]

log clump [['f', '...'], ['1','2','3']], [[],[]]
log clump [['f', '...', 'g'], ['1','2','3']], [[],[]]
log clump [['f', 'g', '...'], ['1','2','3']], [[],[]]

log clump [[['f'], '...'], [['1'],['2'],['3']]], [[],[]]

log clump [['f', '...'], []], [[],[]]
log clump [[['f'], '...'], []], [[],[]]

log clump [[['f'], '...', 'g'], [['1'], '4']], [[],[]]

log clump [['g', ['f'], '...'], ['1']], [[],[]]

log clump [[['f', 'g'], '...'], [['1','2'],['2','3']]], [[],[]]
log clump [[['f', '...'], '...'], [['1','2'],['2']]], [[],[]]

log '--clump - fail'
log clump [ ['f'], [] ], [[],[]]
log clump [ [], ['1'] ], [[],[]]
log clump [ ['f'], ['1','2'] ], [[],[]]
log clump [ ['f','g'], ['1'] ], [[],[]]

log clump [ [['f']], [] ], [[],[]]
log clump [ [['f']], ['1'] ], [[],[]]

# tmplToSeqs : [pattern] -> [seqs]  # do the same, just mapsplit the template though



