root  = @

fs = require 'fs'
_  = require './help.js'


# stackMutator :: expr, stack -> _ (mutates stack)
defaultAlter = (expr, stack) ->
        lower = stack[0]
        if _.toStr.call(lower) is _.obArr
                lower.push expr
        else
                _.val(lower).push expr

involve = (expr, stack) ->
        try
                expr = stack.shift()
                defaultAlter expr, stack
        catch e
                throw new Error("Parse error: " + JSON.stringify(stack))

deeper = (expr, stack) ->
        stack.unshift expr


# matchers :: [[str, expressor, stackMutator]]
matchers = [

        ['comment'
        (str) ->
                chomp = _.isComment.exec(str)
                if chomp
                        [{c: chomp[0][1..]}, chomp[0].length]
        ]

        ['string' # consumes whole string
        (str) ->
                chomp = _.isStr.exec(str)
                if chomp
                        [{s: chomp[0][1..-2]}, chomp[0].length]
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

        ['space'
        (str) ->
                chomp = _.isSpace.exec(str)
                if chomp
                        [{w: chomp[0]}, chomp[0].length]
        (expr, stack) -> false
        ]

        ['atom'
        (str) ->
                chomp = _.isAtom.exec(str)
                if chomp
                        [chomp[0], chomp[0].length]
        ]

        ['nomatch' # debug - makes sure it terminates if nothing matches
        (str) ->
                [' ', 1]]
]


# makeTree :: str, stack -> stack
# the stack accumulates syntax nodes as the str is consumed
makeTree = (str, stack) ->


        until str.length is 0

                for m in matchers

                        match = m[1] str

                        if match
                                (m[2] or defaultAlter) match[0], stack
                                str = str[match[1]..]
                                break
        if stack.length is 1
                stack
        else
                throw new Error('Parse error: ' + JSON.stringify(stack))



parseFile = (file, callback) ->
        fs.readFile file, 'utf-8', (err, data) ->
                callback err, makeTree(data, [[]])



root.parseFile = parseFile