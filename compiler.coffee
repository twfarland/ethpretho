fs = require 'fs'
util = require 'util'
parse = require('./parse').parseFile

parse 'exprs.eth', (err, tree) ->
        log tree


eq  = (x,y) -> JSON.stringify(x) is JSON.stringify(y)
Array::put = Array::unshift
Array::take = Array::shift

log = (n) ->
        console.log util.inspect n, false, null


# turn exprs into js strings
# car is key. cdr is params
primitives =

        # operators
        '+': (ps, env) ->
                '(' + ev(ps[0]) + ' + ' + ev(ps[1]) + ')'

        # func
        '->': (ps, env) ->
                '(function (' + trans(ps[0], env) + ') {  })'

        # conditionals
        'if': (xs, env, ret = false) ->

        # sequence


# compiler has phases, that you can change:
# (define data for each type mentioned)
# parse : sexpString -> syntaxTree
# hygenicExpand : syntaxTree -> syntaxTree
# implicitReturn : syntaxTree -> syntaxTree
# toJs : syntaxTree : javascriptString


# translate:

# in each scope (top level, function def, or macro def)
# 1) collect definition ids only && collect macro ids and definitions

# with this environment,
# 2) on each expr in the body, recursively expand any macros you find in this level
# making sure to gensym as needed (and adding gensyms to environment)

# after all macro expansion at this level,

# 3) translate all child exprs (using primitives when relevant),
# propagating returns at the end of all functions / making function wrappers when necessry, or,

# 3) if atom, return as-is

