root = @

_      = require './utils.js'
subst  = require './toSeqs.js'

toString = {}.toString
log = _.log


# startsScope : expr -> [[param], [expr]] | false
# given an expression, if it starts a new scope,
# (is a function definition or anonymous function)
# return its params block and body
# otherwise false
startsScope = (expr) ->

        first = expr[0]

        if first

                if (first is '->') # anonymous

                        [expr[1], expr[2..]]

                else if ((first is '=') or (first is ':=')) and expr[1] and (toString.call(expr[1]) is '[object Array]') # func def

                        [expr[1][1..], expr[2..]]
                else
                        false
        else
                false



# collects bindings from a scope and extends the environment with them
# dig as far as the next scope (function)
extendBindings = (env, expr) ->

        if startsScope(expr)
                true


log startsScope ['->', ['x'], ['*', 'x', '2']]
log startsScope ['=', ['dub', 'x'], ['*', 'x', '2']]
log startsScope [':=', ['dub', 'x'], ['*', 'x', '2']]
log startsScope [':=', 'x', '1']
log startsScope []