root = @

_      = require './utils.js'

toString = {}.toString

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

        else if toString.call(pattern[0]) is '[object Array]'


                if toString.call(source[0]) is '[object Array]' # matched expr - combine and recur

                        clump [pattern[1..],source[1..]],  append2d( clumped, clumpExpr(pattern[0], source[0])  )

                else # fail - source doesn't match expr

                        false

        else # fail - unhandled case

                throw new Error 'clump failed on pattern:\n' + JSON.stringify(patternSource)



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



# clumpTmpl : [pattern], [seqs] -> [seqs]
# similar to clump, but just clumps the template by itself
clumpTmpl = (tmpl, seqs = []) ->

        until tmpl.length is 0 # done

                if tmpl[1] and (tmpl[1] is '...') # sequence detected

                        seqs.push {seq: clumpTmpl([tmpl[0]])}
                        tmpl.splice 0, 2

                else if typeof tmpl[0] is 'string' # atom, retain as-is

                        seqs.push tmpl[0]
                        tmpl.splice 0, 1

                else if toString.call(tmpl[0]) is '[object Array]' # go down tree

                        seqs.push clumpTmpl(tmpl[0])
                        tmpl.splice 0, 1

                else
                        throw new Error 'clumpTmpl failed on pattern:\n' + JSON.stringify(tmpl)

        seqs



# subsFromPattern : pattern, source -> [{from: pattern, to: source}]
# make a flat list that pairs parts of the pattern
# with their replacement in the source
# dig into subexprs to extract atoms and seqs
# remove upon extraction
# if all pattern and all source used, replacement is possible,
# otherwise return false
# assumes all seqs must have same inner pattern
# i.e. once a seq starts, its contents must be echoed exactly
# sub objects prevent from being replaced twice
subsFromPattern = (pattern, source) ->

        subs = []

        until pattern.length is 0

                if toString.call(pattern[0]) is '[object Array]' # dig into subexpr

                        subs = subs.concat subsFromPattern(pattern[0], source[0])

                else
                        subs.push {from: pattern[0], to: source[0]}

                pattern.splice 0, 1
                source.splice 0, 1

        if source.length is 0

                subs
        else
                false




applySub = (onMatch) -> (sub, tmpl, newTmpl = []) ->

        until tmpl.length is 0

                 e = tmpl[0]

                 if toString.call(e) is '[object Array]'

                        newTmpl.push applySub(onMatch)(sub, e)

                 else if _.eq sub.from, e

                        newTmpl.push onMatch(sub, e)
                 else
                        newTmpl.push e

                 tmpl.splice 0, 1
        newTmpl


# mutates tmpl
applyAllSubs = (onMatch, subs, tmpl) ->

        for sub in subs
                tmpl = applySub(onMatch)(sub, tmpl)
        tmpl


# apply subs from env, then those from pattern/source
# pattern, source, and tmpl must be clumped
substitute = (pattern, source, tmpl, envSubs) ->

        pattSubs = subsFromPattern(pattern, source)

        envMatch = (sub,e) -> {from: sub.from, to: sub.from + '_'}

        pattSrcMatch = (sub,e) -> sub

        applyAllSubs(
                pattSrcMatch,
                pattSubs,
                applyAllSubs(
                        envMatch,
                        envSubs,
                        tmpl
                )
        )



root.clump       = clump
root.clumpExpr   = clumpExpr
root.clumpSeq    = clumpSeq
root.append2d    = append2d
root.splitByElip = splitByElip
root.clumpTmpl   = clumpTmpl
root.trySubst    = trySubst
root.subsFromPattern = subsFromPattern
root.applySub = applySub
root.applyAllSubs = applyAllSubs
root.substitute     = substitute


# after expanding macro - collect new bindings in scope before expanding further