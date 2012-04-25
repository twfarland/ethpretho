fs    = require 'fs'
util  = require 'util'

objProto      = Object.prototype
arrProto      = Array.prototype
nativeForEach = arrProto.forEach
nativeMap     = arrProto.map

_  = @

_.log = (n) ->
        console.log util.inspect n, false, null

_.eq = (x,y) ->
        JSON.stringify(x) is JSON.stringify(y)

_.key = (o) ->
        (k for k, v of o)[0]
_.val = (o) ->
        (v for k, v of o)[0]

_.assert = (mode) -> (x, y) ->

       if mode is '-v'
               if eq(x, y)
                       log ['Pass', x, y]
               else
                       log ['Fail', x, y]
       else
               log eq(x, y)

_.toStr     = objProto.toString
_.obArr     = '[object Array]'
_.obObj     = '[object Object]'
_.isComment = /^;.*/
_.isStr     = /^\"(([^\\]*?|(\\.))*?)\"/
_.isSpace   = /^\s+/
_.isAtom    = /^[^\;\"\n\t\(\)\[\]\{\}\s]+/
_.isInt     = /\d+/
_.isSymbol  = /^[\_|\|$A-z][\_|\|$A-z|\d]*/
_.isRegex   = /^\/([^\\]*?|(\\.))*?\/[img]*/


_.pairize = (arr) ->
        odd = false
        res = []
        for v, k in arr
                if odd
                        res.push [arr[k-1], v]
                        odd = false
                else
                        odd = true
        res

_.partition = (test, arr) ->
        pass = []
        fail = []
        for a in arr
                if test a
                        pass.push a
                else
                        fail.push a
        [pass, fail]

_.isIn = (e, arr) -> arr.indexOf(e) >= 0

_.map = (ls, f, ctx) ->
        if nativeMap and (nativeMap is ls.map)
                ls.map f, ctx
        else
                res = []
                for v, k in ls
                        res.push f.call(ctx, v, k, ls)
                res

_.each = (ls, f, ctx) ->
        if nativeForEach and (ls.forEach is nativeForEach)
                ls.forEach f, ctx
        else
                for v, k in ls
                        f.call ctx, v, k, ls