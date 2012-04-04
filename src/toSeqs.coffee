root = @

# todo : convert accumulator funcs to loops



# clump : [[pattern], [pattern]] -> [[seqs], [seqs]] | false
clump = (patternSource, clumped) ->

        pattern = patternSource[0]
        source  = patternSource[1]

        if pattern.length is 0

                if source.length is 0 # success - pattern and source consumed

                        clumped

                else # fail - source not consumed

                        false

        else if pattern[1] and (pattern[1] is '...') # sequence detected

                [pSeq, pRest, sSeq, sRest] = splitByElip pattern, source

                clump [pRest, sRest],  append2d( clumped, clumpSeq([pSeq, sSeq], [[],[]])  )

        else if source.length is 0 # fail - pattern not consumed, and not seq

                false

        else if typeof pattern[0] is 'string'

                if typeof source[0] is 'string' # matched atom - combine and recur

                        clump [pattern[1..],source[1..]],  append2d( clumped, [[pattern[0]], [source[0]]] )

                else # fail - source doesn't match atom

                        false

        else if {}.toString.call(pattern[0]) is '[object Array]'


                if {}.toString.call(source[0]) is '[object Array]' # matched expr - combine and recur

                        clump [pattern[1..],source[1..]],  append2d( clumped, clumpExpr(pattern[0], source[0])  )

                else # fail - source doesn't match expr

                        false

        else # fail - unhandled case

                throw new Error 'Pattern expansion (toSeqs) failed on pattern:\n' + JSON.stringify(patternSource)



# clumpExpr : # clump : [pattern], [pattern] -> [[[seqs]], [[seqs]]] | false
clumpExpr = (pattern, source) ->

        [cPattern, cSource] = clump [pattern, source], [[],[]]
        [[cPattern], [cSource]]



# clumpSeq : [patt, patt], [patt, patt] -> [seq, seq]
clumpSeq = (seqs, clumped) ->

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

        pSeq     = [pattern[0]]
        pRest    = pattern[2 ..]
        sSeq     = source[.. source.length - pRest.length - 1]
        sRest    = source[source.length - pRest.length ..]

        [pSeq, pRest, sSeq, sRest]



# tmplToSeqs : [pattern] -> [seqs]  # do the same, just mapsplit the template though



root.clump       = clump
root.clumpExpr   = clumpExpr
root.clumpSeq    = clumpSeq
root.append2d    = append2d
root.splitByElip = splitByElip