root  = @

fs = require 'fs'
_  = require './utils.js'

Array::put = Array::unshift
Array::take = Array::shift

toStr = {}.toString
obArr = '[object Array]'


# stackMutator :: expr, stack -> _ (mutates stack)
defaultAlter = (expr, stack) ->
        lower = stack[0]
        if toStr.call(lower) is obArr
                lower.push expr
        else
                _.val(lower).push expr

involve = (expr, stack) ->
        expr = stack.take()
        defaultAlter expr, stack

deeper = (expr, stack) ->
        stack.put expr


# matchers :: [[str, expressor, stackMutator]]
matchers = [

        ['string' # consumes whole string
        (str) ->
                 if str[0] is '"'
                        [res, rest] = ['', str[1..]]

                        for c, k in rest
                                if (c is '"') and (rest[k - 1] isnt '\\') then break else res += c

                        [{s: res}, res.length + 2]
        ]

        ['openexp'
        (str) -> if str[0] is '(' then [[], 1]
        deeper
        ]

        ['closeexpr'
        (str) -> if str[0] is ')' then [null, 1]
        involve
        ]

        ['openarr'
        (str) -> if str[0] is '[' then [a: [], 1]
        deeper
        ]

        ['closearr'
        (str) -> if str[0] is ']' then [null, 1]
        involve
        ]

        ['openobj'
        (str) -> if str[0] is '{' then [o: [], 1]
        deeper
        ]

        ['closeobj'
        (str) -> if str[0] is '}' then [null, 1]
        involve
        ]

        ['line'
        (str) -> if str[0] is '\n' then ['\n', 1]
        (expr, stack) -> false
        ]

        ['space'
        (str) ->
                if str[0] is ' '
                        res = ' '
                        for c, k in str[1..]
                                if c is ' ' then res += ' ' else break

                        [{w: res}, res.length]

        (expr, stack) -> false
        ]

        ['atom'

        (str) ->
                res = ''
                for c, k in str
                        next = str[k + 1]

                        if next and (next in ' \n\t()[]{}"')
                                res += c
                                break
                        else
                                res += c

                [res, res.length]
        ]
]



# makeTree :: str, stack -> stack
# the stack accumulates syntax nodes as the str is consumed
makeTree = (str, stack) ->

        chars = [].slice.call str

        until chars.length is 0

                for m in matchers

                        match = m[1] chars

                        if match

                                (m[2] or defaultAlter) match[0], stack
                                chars.splice 0, match[1]
                                break
        stack


# async parse
parseFile = (file, callback) ->
        fs.readFile file, 'utf-8', (err, data) ->
                callback err, makeTree(data, [[]])



root.parseFile = parseFile
