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



root.log = log
root.eq  = eq
root.key = key
root.val = val
