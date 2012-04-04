root  = @

fs    = require 'fs'
util  = require 'util'


Array::put = Array::unshift
Array::take = Array::shift


log = (n) ->
        console.log util.inspect n, false, null


eq  = (x,y) ->
        JSON.stringify(x) is JSON.stringify(y)


key = (o) -> (k for k, v of o)[0]
val = (o) -> (v for k, v of o)[0]


assert = (mode) -> (x, y) ->

       if mode is '-v'
               if eq(x, y)
                       log ['Pass', x, y]
               else
                       log ['Fail', x, y]
       else
               log eq(x, y)


root.log = log
root.eq  = eq
root.key = key
root.val = val
root.assert = assert
