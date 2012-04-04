fs = require 'fs'
util = require 'util'
parse = require('./parse').parseFile

parse 'exprs.eth', (err, tree) ->
        log tree

Array::put = Array::unshift
Array::take = Array::shift

log = (n) ->
        console.log util.inspect n, false, null

key = (o) -> (k for k, v of o)[0]
val = (o) -> (v for k, v of o)[0]

# all2d :: (a, b -> bool), [a], [b] -> bool
all2d = (test, xs, ys) ->
        if xs.length is ys.length
                for x, k in xs
                        y = ys[k]
                        if not (y and test(x, y)) then return false
                true
        else
                false

# pEq :: expr -> expr -> Bool
pEq = (x, y) ->

        xtype = typeof x
        ytype = typeof y

        if xtype is ytype

                if xtype is 'string' # both are atoms

                else
                        xtype = {}.toString.call x
                        ytype = {}.toString.call y

                        if xtype is ytype

                                if xtype is '[object Array]' # expr
                                        all2d pEq, x, y
                                else
                                        key(x) is key(y) and all2d pEq, val(x), val(y)
                        else
                                false
        else
                false


# reserve elipses



# an Expr is 'atom' | '...' | [patternExpr]

# a tplExpr is Expr | { subst: [Expr Expr] }

# expand :: expr, expr, [tplExpr] -> false | [tplExpr]
expand = (pattern, source, template) ->

        toReplace = (e for e in template when {}.toString.call(e) is '[object Array]')

        if pattern.length is 0

                if toReplace.length is 0
                        template
                else
                        false # pattern was consumed, but template not completed
        else
                test = buildMatcher pattern[0]


