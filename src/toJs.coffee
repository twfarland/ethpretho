_        = require './help.js'
parse    = require './parse.js'
fs       = require 'fs'
util     = require 'util'

root     = @

toStr     = _.toStr
obArr     = _.obArr
obObj     = _.obObj
log       = _.log
isInt     = _.isInt
isSymbol  = _.isSymbol
pairize   = _.pairize
partition = _.partition
isIn      = _.isIn
map       = _.map
each      = _.each

# container
treeToJs = (extra) ->

        extra = extra or {}

        branchers = ['if', 'switch', 'try']
        blockCreators = branchers.concat ['for', 'while']
        noWrap = ['', '=','()','return', 'throw', 'new', 'for']
        openSpace = ['->', '']

        isFirstIn = (set) -> (e) -> e[0] and (e[0] in set)

        isBrancher = isFirstIn branchers
        isBlockCreator = isFirstIn blockCreators

        sBlock = (sep) -> (exprs, p, i) ->
                if exprs.length is 0
                        '()'
                else
                        '(' + (toJs e, '()', i for e in exprs).join(sep) + ')'

        argBlock = sBlock ', '
        iniBlock = sBlock '; '

        prepBranch = (e) -> # rewrite
                if e[0] and (e[0] is ',')
                        e[1..]
                else
                        [e]

        getIndent = (i) ->
                res = ''
                until i < 1
                        res += '    '
                        i--
                res

        getSemi = (e) ->
                if isBlockCreator(e) or e.c
                        ''
                else
                        ';'

        getRef = (e, i) ->
                if (typeof e is 'string') and isSymbol.exec(e)
                        '.' + e

                else if (toStr.call(e) is obObj) and (_.key(e) is 'a')

                        '[' + toJs(e.a[0], '.', i) + ']'
                else
                        '[' + toJs(e, '.', i) + ']'

        wrap = (res, p) ->
                if p in noWrap
                        res
                else
                        '(' + res + ')' # wrap if it has a parent

        selfCollect = (e, p, i) ->
                pre = e.slice 0, -1
                last = e.slice -1

                wrap (toJs [ ['->', [], [':=', 'res_', {a: []}], pre.concat([['res_.push', last[0]]]), 'res_'] ], p, i), e[0]

        # primitive exprs - may need to eval to something depending on p
        prim =
                ':=': (e, p, i) ->
                        if e.length > 2
                                'var ' + prim['='] e, p, i
                        else
                                'var ' + e[1]

                '=': (e, p, i) ->
                        if not e[2]
                                toJs(e[1], '=', i)
                        else
                                pairs = pairize e[1..]
                                (toJs(pair[0], '=', i) + ' = ' + toJs(pair[1], '=', i) for pair in pairs).join(',\n' + getIndent(i))

                '.': (e, p, i) -> # member access, chaining, slices

                        mem = e[1]
                        res = toJs mem, '.', i
                        parts = e[2..]

                        for part in parts

                                if typeof part is 'string' # atom
                                        res += getRef part, i # [0]  |  .y

                                else if toStr.call(part) is obArr #()

                                        if prim[part[0]]
                                                res += '[' + prim[part[0]](part, '.', i)  + ']' # x[(true ? 1 : 2)]
                                        else
                                                res += getRef(part[0], i) + argBlock(part[1..], '.', i) # .x(1, 2, y(z))  |  [z(x)](1,2)

                                else if toStr.call(part) is obObj

                                        if _.key(part) is 's'
                                                res += '["' + part.s + '"]' # ["x y"]

                                        if _.key(part) is 'a'
                                                if part.a.length is 2
                                                        res += '.slice' + argBlock(part.a[..1], 'slice', i) # .slice(0, x(y))
                                                else
                                                        res += '[' + toJs(part.a[0], '.', i) + ']' # [x(y)]

                                else throw new Error('Invalid reference')
                        res

                '->': (e, p, i) -> # function
                        res = 'function (' + e[1].join(', ') + ') ' + block(e[2..], '->', i)
                        if p is ''
                                '(' + res + ')'
                        else
                                wrap res, p

                'throw': (e, p, i) ->
                        'throw ' + toJs(e[1], 'throw', i)

                'return': (e, p, i) ->
                        'return ' + toJs(e[1], 'return', i)

                '?': (e, p, i) ->
                        wrap (toJs(e[1],'()',i) + ' ? ' + toJs(e[2],'()',i) + ' : ' + toJs(e[3],'()',i) ), p

                'if': (e, p, i) -> # (?? (< 2 3) 4 5)

                        if p in openSpace

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
                                if e.length is 4
                                        # use ternary
                                        toJs ['?'].concat(e[1..]), p, i
                                else
                                        # wrap in self-calling func
                                        wrap (toJs [['->', [], e]], p, i), 'if'


                'try': (e, p, i) -> # (try e (, stuff) (, catch) (, finally))

                        if p in openSpace

                                res = 'try ' + block(prepBranch(e[2]), p, i)
                                if e[3]
                                       res += ' catch (' + toJs(e[1], '()', i) + ') ' + block(prepBranch(e[3]), p, i)
                                if e[4]
                                       res += ' finally ' + block(prepBranch(e[4]), p, i)
                                res
                        else
                                wrap (toJs [['->', [], e]], p, i), 'try'

                'while': (e, p, i) -> # (while clause body ...)

                        if p in openSpace

                                'while ' + iniBlock([e[1]], 'while', i) + ' ' + block(e[2..], '', i)
                        else
                                selfCollect e, p, i

                'for': (e, p, i) -> # (for (clauses...) body...) - just the basic js for

                        if p in openSpace

                                'for ' + iniBlock(e[1], 'for', i) + ' ' + block(e[2..], '', i)
                        else
                                selfCollect e, p, i


        # put operators into primitives
        binaryPr = (sym) -> (e, p, i) ->
                wrap (toJs(e_, sym, i) for e_ in e[1..]).join(' ' + sym + ' '), p # always eval to something

        binaryAlwaysWrap = (sym) -> (e, p, i) ->
                wrap (toJs(e_, sym, i) for e_ in e[1..]).join(' ' + sym + ' '), 'wrap'

        binaryChain = (sym) -> (e, p, i) -> # (x s y && y s b && b s a)
                if e.length > 3

                        left = e[1]
                        res  = ['&&']

                        for e_ in e[2..]
                                res.push [sym, left, e_]
                                left = e_

                        toJs res, p, i
                else
                        wrap (toJs(e[1], sym, i) + ' ' + sym + ' ' + toJs(e[2], sym, i)), p

        unaryPost = (sym) -> (e, p, i) ->
                wrap e[1] + sym, p

        unaryPr = (sym) -> (e, p, i) ->
                if e.length < 3
                        arg = e[1]
                else
                        arg = e[1..]

                wrap sym + ' ' + toJs(arg, p, i), p

        placePrim = (func, ls) ->
                for op in ls
                        prim[op] = func op

        placePrim binaryPr, ["+=", "*=", "/=", "%=", "-=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]
        placePrim binaryAlwaysWrap, ["*", "/", "%", "+", "-", "&&", "||", ","]
        placePrim binaryChain, ["==", "!=", "===", "!==", ">", ">=", "<", "<=", "in", "of", "instanceof"]
        placePrim unaryPost, ["++", "--"]
        placePrim unaryPr, ["typeof", "new", "throw", "!"]

        # extend with any extra primitives
        for k, v of extra
                prim[k] = v

        # BLOCK and TOJS form the core
        block = (exprs, p, i = 0) ->

                # p can only ever be '->' or '' here - it is reset when entering a block.
                # indent all children
                # a block may need to return its last elem
                # everything at top level of block gets appended with a ';' if it is not a block
                # if you need to ret, and last item is a branch, do the cond, reting all its children
                # if you need to ret, and last item is a loop, make the loop a comprehension
                # reset stk on all top-level elems
                # noBrk is used in switch statements

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
                        e = last[0]

                        if isBrancher(e)
                                res += toJs(e, p, i_) + getSemi(e)

                        else if p is '->'
                                if e[0] and e[0] is 'throw'
                                        res += 'throw ' + (toJs e[1], 'throw', i_) + getSemi(e)
                                else
                                        res += (toJs ['return', e], p, i_) + getSemi(e)
                        else
                                res += toJs(e, p, i_) + getSemi(e)

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
                                        toJs(first, '', i) + argBlock(expr[1..], first, i)
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

                        else if exprKey is 'c'
                                '//' + expr.c

                        else
                                # unhandled case
                                throw new Error('Unhandled case: ' + util.inspect(expr))

        @toJs = toJs
        @block = block
        @trans = (tree, callback) ->

                callback null, block(tree[0], '', 0)[2..-2]

        @


root.treeToJs = new treeToJs()
