fs = require 'fs'
util = require 'util'
parse = require('./parse').parseFile


eq  = (x,y) -> JSON.stringify(x) is JSON.stringify(y)
Array::put = Array::unshift
Array::take = Array::shift

log = (n) ->
        console.log util.inspect n, false, null

# design with acc func, convert to loop when it works

# clump : [[pattern], [pattern]] -> [[seqs], [seqs]] | false

clump = (patternSource, clumped) ->

        pattern = patternSource[0]
        source  = patternSource[1]

        # edge cases
        if pattern.length is 0

                if source.length is 0                   # success - pattern and source consumed

                        clumped
                else                                    # fail - source not consumed
                        false

        # recursive cases
        else if pattern[1] and (pattern[1] is '...')    # sequence

                [pSeq, pRest, sSeq, sRest] = splitByElip pattern, source

                clump [pRest, sRest],  append2d( clumped, clumpSeq([pSeq, sSeq], [[],[]])  )

        else if source.length is 0                      # fail - pattern not consumed, and not seq

                false

        else if typeof pattern[0] is 'string'

                if typeof source[0] is 'string'         # matched atom - combine and recur

                        clump [pattern[1..],source[1..]],  append2d( clumped, [[pattern[0]], [source[0]]] )
                else
                        false                           # fail - source doesn't match atom

        else if {}.toString.call(pattern[0]) is '[object Array]'

                if {}.toString.call(source[0]) is '[object Array]'       # matched expr - combine and recur

                        clump [pattern[1..],source[1..]],  append2d( clumped, clumpExpr(pattern[0], source[0])  )
                else
                        false                           # fail - source doesn't match expr
        else
                throw new Error 'Unhandled case'        # fail - something weird happened


# clumpExpr : # clump : [pattern], [pattern] -> [[[seqs]], [[seqs]]] | false
clumpExpr = (pattern, source) ->

        [cPattern, cSource] = clump [pattern, source], [[],[]]
        [[cPattern], [cSource]]


# clumpSeq : [patt, patt], [patt, patt] -> [seq, seq]
# convert to iterative when working
# examples: [['f'], ['1','2','3']]   ->  [[seq: ['f']], [seq: ['1','2','3']]]

clumpSeq = (seqs, clumped) ->

        # map clump with the p on the s, wrap results in seqs
        pSeq = seqs[0]
        sSeq = seqs[1]

        pClumped = seqs[0]
        sClumped = []

        for s in sSeq

                sClump = clump [pSeq, [s]], [[],[]]

                if sClump and sClump[0][0]

                        pClumped = sClump[0]
                        sClumped = sClumped.concat sClump[1]
                else
                        return false

        [[ seq: pClumped ], [ seq: sClumped ]]


# append2d : [[x],[y]], [[x],[y]] -> [[x],[y]]
append2d = (xs, ys) ->

        if not (xs or ys)

                false
        else
                [xs[0].concat(ys[0]), xs[1].concat(ys[1])]

# splitByElip : pattern, pattern -> [pattern, pattern, pattern, pattern]
splitByElip = (pattern, source) ->

        pSeq     = [pattern[0]]  #['f']
        pRest    = pattern[2 ..] #['g'] (1)
        sSeq     = source[.. source.length - pRest.length - 1] #['1','2','3']
        sRest    = source[source.length - pRest.length ..]

        [pSeq, pRest, sSeq, sRest]


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



