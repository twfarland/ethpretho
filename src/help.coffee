fs    = require 'fs'
util  = require 'util'

_  = @

_.log = (n) ->
        console.log util.inspect n, false, null

_.eq = (x,y) ->
        JSON.stringify(x) is JSON.stringify(y)

_.key = (o) -> (k for k, v of o)[0]
_.val = (o) -> (v for k, v of o)[0]

_.assert = (mode) -> (x, y) ->

       if mode is '-v'
               if eq(x, y)
                       log ['Pass', x, y]
               else
                       log ['Fail', x, y]
       else
               log eq(x, y)

_.toStr     = {}.toString
_.obArr     = '[object Array]'
_.obObj     = '[object Object]'
_.isComment = /^;.*/
_.isStr     = /^\"(([^\"]|(\\\\\"))*[^\\\\])?\"/
_.isSpace   = /^\s+/ # also catches line breaks
_.isAtom    = /^[^\;\"\n\t\(\)\[\]\{\}\s]+/
_.isInt     = /\d+/
_.isSymbol  = /^[\_|\|$A-z][\_|\|$A-z|\d]*/
