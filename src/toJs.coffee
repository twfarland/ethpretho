# todo : get all of js primitives. incl switch, try/catch etc
# parse / compile comments
# write test suite
# rewrite in itself
# write hygenic macro system

root = @

_      = require './utils.js'
parse  = require './parse.js'
fs     = require 'fs'
util   = require 'util'

toStr = {}.toString
obArr = '[object Array]'
log = _.log

# utils

getIndent = (i) ->
        res = ''
        until i < 1
                res += '    '
                i--
        res

pairize = (arr) ->
        odd = false
        res = []
        for v, k in arr
                if odd
                        res.push [arr[k-1], v]
                        odd = false
                else
                        odd = true
        res

branchers = ['if', 'switch', ',']
blockCreators = branchers.concat ['for']
noWrap = ['','=','()','return']

isBrancher = (e) ->
        e[0] and e[0] in branchers

prepBranch = (e) -> # rewrite
        if isBrancher e
                e[1..]
        else
                [e]

getSemi = (e) ->
        if e[0] and (e[0] in blockCreators)
                ''
        else
                ';'

wrap = (res, p) ->
        if p in noWrap then res else '(' + res + ')' # wrap if it has a parent


# primitive exprs - may need to eval to something depending on p
prim =
        ':=': (e, p, i) ->
                if e.length > 2
                        'var ' + prim['='] e, p, i
                else
                        'var ' + e[1] # todo - handle multiple var defs

        '=': (e, p, i) ->
                if toStr.call(e[1]) is obArr

                        toJs(e[1][0], '=', i) + ' = ' + toJs(['->', e[1][1..]].concat(e[2..]), '=', i)
                else
                        toJs(e[1], '=', i) + ' = ' + toJs(e[2], '=', i)

        '.': (e, p, i) -> # member access

                ref = e[2]

                if toStr.call(ref) is obArr

                        if ref.length is 1
                                key = '[' + ref[0] + ']' # [i]
                        else
                                return toJs ['.', e[1], 'slice', ref[0], ref[1]], p, i # range rewrite -> e.slice(i, j)
                else
                        if /\d+/.exec(ref)
                                key = '['+ ref + ']' # ["i"]
                        else
                                key = '.' + ref # .i

                if e[3..].length > 0

                        fCall = '(' + (toJs(e_, '.', i) for e_ in e[3..]).join(', ') + ')'
                else
                        fCall = ''

                toJs(e[1], '[]', i) + key + fCall


        '->': (e, p, i) -> # function
                'function (' + e[1].join(', ') + ') ' + block(e[2..], '->', i)

        'return': (e, p, i) ->
                'return ' + toJs(e[1], 'return', i) + ';'


        # control flow branchers

        'if': (e, p, i) -> # e.g: (?? (< 2 3) 4 5)

                if p is '->' or p is '' # in open space - just do side effects

                        prd = e[1..]

                        res = 'if (' + toJs(prd[0], '()', i) + ') ' + block(prepBranch(prd[1]), p, i)
                        prd.splice 0, 2

                        until prd.length is 0

                                if prd.length is 1
                                        res += ' else ' + block(prepBranch(prd[0]), p, i)
                                        prd.splice 0, 1
                                else
                                        res += ' else if (' + toJs(prd[0], '()', i) + ') ' + block(prepBranch(prd[1]), p, i)
                                        prd.splice 0, 2
                        res
                else
                        wrap (toJs [['->', [], e]], p, i), 'if' # needs to eval to something, so wrap in self-calling func


        'for': (e, p, i) -> # e.g: (for (clauses) body...) - just the basic js for

                if p is '->' or p is '' # in open space - just do side effects

                        'for (' + (toJs(e_, '', i) for e_ in e[1]).join('; ')  + ') ' + block(e[2..], '', i)

                else    # in an expr - wrap in self-calling func and collect results into array - a REWRITE
                        pre     = e.slice 0, -1
                        last    = e.slice -1

                        wrap (toJs [ ['->', [], [':=', 'res_', {a: []}], pre.concat([['res_.push', last[0]]]), 'res_'] ], p, i), 'for'

        # open block creators


# change parent WHEN YOU MAKE AN EXPR
# make thing eval to something or not based on p WHEN IT IS MADE
# do syntax tree REWRITES to implement implicit return. not special toJs cases.




# put operators into primitives

binaryPr = (sym) -> (e, p, i) ->
        wrap (toJs(e_, sym, i) for e_ in e[1..]).join(' ' + sym + ' '), p # always eval to something


unaryPost = (sym) -> (e, p, i) ->
        if p is ''
                wrap e[1] + sym, p
        else
                wrap e[1] + sym + ', ' + e[1], p

unaryPr = (sym) -> (e, p, i) ->
        if e.length < 3
                arg = e[1]
        else
                arg = e[1..]

        wrap sym + ' ' + toJs(arg, p, i), p

dualPr = (sym) -> (e, p, i) -> # always eval to something
        if e.length is 2
                wrap sym + e[1], p
        else
                wrap (toJs(e_, sym, i) for e_ in e[1..]).join(' ' + sym + ' '), p

for op in ['*', '/', '%',
           '+=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=',
           '==', '!=', '===', '!==', '>', '>=', '<', '<=',
           'in', 'instanceof',
           '&&', '||', ',']
        prim[op] = binaryPr op

for op in ['++','--']
        prim[op] = unaryPost op

for op in ['typeof', 'new', 'throw']
        prim[op] = unaryPr op

for op in ['+', '-', '!']
        prim[op] = dualPr op



block = (exprs, p, i) ->

        # p can only ever be '->' or '' here - it is reset when entering a block.
        # indent all children
        # a block may need to return its last elem
        # everything at top level of block gets appended with a ';' if it is not a block
        # if you need to ret, and last item is a branch, do the cond, reting all its children
        # if you need to ret, and last item is a loop, make the loop a comprehension
        # reset stk on all top-level elems

        pre  = exprs.slice 0, -1
        last = exprs.slice -1

        ind = getIndent i
        i_ = i + 1 # increment indentation level for children

        res = '{\n'

        if pre.length > 0 # pre elements

                for e in pre
                        res += ind + toJs(e, '', i_)  + getSemi(e) + '\n' # reset par - in open block

        if last.length is 1 # last element

                res += ind

                if isBrancher last[0]
                        res += toJs(last[0], p, i_) + getSemi(last[0])

                else if p is '->'
                        res += toJs ['return', last[0]], p, i_
                else
                        res += toJs(last[0], p, i_) + getSemi(last[0])

        res + '\n' + getIndent(i - 1) + '}'


# p is the parent expression, or '', which is a normal block, or '->', which is a function body
# i is the indentation level, which is increased inside blocks
toJs = (expr, p = '', i) ->

        if typeof expr is 'string'

                # base primitive: atom
                expr

        else if toStr.call(expr) is obArr

                first = expr[0]

                if first

                        if prim[first]

                                # primitive expr - go to table for a solution
                                prim[first] expr, p, i

                        else
                                # user-defined: function call
                                toJs(first, '', i) + '(' + (toJs e, first, i for e in expr[1..]).join(', ') + ')'
                else
                        ''
        else
                exprKey = _.key expr

                if exprKey is 's'

                        # base primitive: string literal
                       '"' + expr.s + '"'

                else if exprKey is 'a'

                        # base primitive: array literal
                        '[' + (toJs e, '[]', i for e in expr.a).join(', ') + ']'

                else if exprKey is 'o'

                        # base primitive: object literal
                        pairs = pairize expr.o
                        '{' + (toJs(pair[0], '{}', i) + ': ' + toJs(pair[1], '{}', i) for pair in pairs).join(', ') + '}'
                else
                        # unhandled case
                        throw new Error('Unhandled case: ' + util.inspect(expr))


parse.parseFile '../tests/exprs.eth', (err, data) ->

        log data

        fs.writeFile '../tests/exprs.js', block(data[0], '', 0)[2..-2], (err) ->
            if err
                console.log err
            else
                console.log 'saved'