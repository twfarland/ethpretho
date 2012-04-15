root = @

_      = require './utils.js'
parse  = require './parse.js'
fs     = require 'fs'
util   = require 'util'

toStr = {}.toString
obArr = '[object Array]'
log = _.log


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



branchers     = ['??', 'switch']
blockCreators = branchers.concat ['for']


# primitive exprs - may need to eval to something depending on p
prim =
        ':=': (e, p) ->
                'var ' + prim['='] e, p

        '=': (e, p) ->
                if toStr.call(e[1]) is obArr

                        toJs(e[1][0], '=') + ' = ' + toJs(['->', e[1][1..]].concat(e[2..]), '=')
                else
                        toJs(e[1], '=') + ' = ' + toJs(e[2], '=')

        '.': (e, p) ->
                if toStr.call(e[2]) is obArr

                        key = e[2][0]
                else
                        key = '"'+ e[2] + '"'

                if e[3..].length > 0

                        fCall = '(' + (toJs(e_, '.') for e_ in e[3..]).join(', ') + ')'
                else
                        fCall = ''

                toJs(e[1], '[]') + '[' + key + ']' + fCall # todo - ranges for arrays

        '->': (e, p) -> # function
                '(function (' + e[1].join(', ') + ') ' + block(e[2..], '->') + ')'

        'return': (e, p) ->
                'return ' + toJs(e[1], 'return') + ';'

        ',,': (e, p) -> # sequence - implies block - shouldn't be used directly
                block e[1..], p

        # control flow branchers

        '??': (e, p) -> # e.g: (?? (< 2 3) 4 5)

                if p is '->' or p is '' # in open space - just do side effects

                        prd = e[1..]

                        res = 'if (' + toJs(prd[0], '??') + ') ' + block(prepBranch(prd[1]), p)
                        prd.splice 0, 2

                        until prd.length is 0

                                if prd.length is 1
                                        res += ' else ' + block(prepBranch(prd[0]), p)
                                        prd.splice 0, 1
                                else
                                        res += ' else if (' + toJs(prd[0], '??') + ') ' + block(prepBranch(prd[1]), p)
                                        prd.splice 0, 2
                        res
                else
                        toJs [['->', [], e]], p # needs to eval to something, so wrap in self-calling func


        'for': (e, p) -> # e.g: (for (clauses) body...) - just the basic js for

                if p is '->' or p is '' # in open space - just do side effects

                        'for (' + (toJs(e_, '') for e_ in e[1]).join('; ')  + ') ' + block(e[2..], '')

                else    # in an expr - wrap in self-calling func and collect results into array - a REWRITE
                        pre     = e.slice 0, -1
                        last    = e.slice -1

                        toJs [ ['->', [], [':=', 'res_', {a: []}], pre.concat([['res_.push', last[0]]]), 'res_'] ],

        # open block creators


# change parent WHEN YOU MAKE AN EXPR
# make thing eval to something or not based on p WHEN IT IS MADE
# do syntax tree REWRITES to implement implicit return. not special toJs cases.




# put operators into primitives
wrap = (res, p) ->
        if p in ['','='] then res else '(' + res + ')' # wrap if it has a parent

binaryPr = (sym) -> (e, p) ->
        wrap (toJs(e_, sym) for e_ in e[1..]).join(' ' + sym + ' '), p # always eval to something


unaryPr = (sym) -> (e, p) ->
        if p is ''
                wrap e[1] + sym, p
        else
                wrap e[1] + sym + ', ' + e[1], p


dualPr = (sym) -> (e, p) -> # always eval to something
        if e.length is 2
                wrap sym + e[1] + ')', p
        else
                wrap (toJs(e_, sym) for e_ in e[1..]).join(' ' + sym + ' '), p

for op in ['*', '/', '%',
           '+=', '*=', '/=', '%=', '+=', '-=', '<<=', '>>=', '>>>=', '&=', '^=', '|=',
           '==', '!=', '===', '!==', '>', '>=', '<', '<=',
           'in']
        prim[op] = binaryPr op

for op in ['++','--', 'typeof']
        prim[op] = unaryPr op

for op in ['+', '-', '!']
        prim[op] = dualPr op


prepBranch = (e) -> # rewrite
        if e[0] and e[0] is ',,'
                e[1..]
        else
                [e]

isBrancher = (e) ->
        e[0] and e[0] in branchers

getSemi = (e) ->
        if e[0] and (e[0] in blockCreators)
                ''
        else
                ';'


block = (exprs, p) ->

        # p can only ever be '->' or '' here - it is reset when entering a block.
        # indent all children
        # a block may need to return its last elem
        # everything at top level of block gets appended with a ';' if it is not a block
        # if you need to ret, and last item is a branch, do the cond, reting all its children
        # if you need to ret, and last item is a loop, make the loop a comprehension
        # reset stk on all top-level elems

        pre  = exprs.slice 0, -1
        last = exprs.slice -1

        res = '{\n'

        if pre.length > 0 # pre elements

                for e in pre
                        res += toJs(e, '')  + getSemi(e) + '\n' # reset par - in open block

        if last.length is 1 # last element

                if isBrancher last[0]
                        res += toJs(last[0], p) + getSemi(last[0])

                else if p is '->'
                        res += toJs ['return', last[0]], p
                else
                        res += toJs(last[0], p) + getSemi(last[0])

        res + '\n}'


# p is the parent expression, or '', which is a normal block, or '->', which is a function body

toJs = (expr, p = '') ->

        if typeof expr is 'string'

                # base primitive: atom
                expr

        else if toStr.call(expr) is obArr

                first = expr[0]

                if first

                        if prim[first]

                                # primitive expr - go to table for a solution
                                prim[first] expr, p

                        else
                                # user-defined: function call
                                toJs(first) + '(' + (toJs e, first for e in expr[1..]).join(', ') + ')'
                else
                        ''
        else
                exprKey = _.key expr

                if exprKey is 's'

                        # base primitive: string literal
                       '"' + expr.s + '"'

                else if exprKey is 'a'

                        # base primitive: array literal
                        '[' + (toJs e, '[]' for e in expr.a).join(', ') + ']'

                else if exprKey is 'o'

                        # base primitive: object literal
                        pairs = pairize expr.o
                        '{' + (toJs(pair[0], '{}') + ': ' + toJs(pair[1], '{}') for pair in pairs).join(', ') + '}'
                else
                        # unhandled case
                        throw new Error('Unhandled case: ' + util.inspect(expr))


parse.parseFile '../tests/exprs.eth', (err, data) ->

        log data

        fs.writeFile '../tests/exprs.js', block(data[0])[2..-2], (err) ->
            if err
                console.log err
            else
                console.log 'saved'