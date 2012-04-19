root = @

_      = require './utils.js'
parse  = require('./parse.js').parseFile
treeToJs  = require('./toJs.js').treeToJs
fs     = require 'fs'
util   = require 'util'


parse '../tests/exprs.eth', (err, parseTree) ->

        treeToJs.trans parseTree, (err, jsString) ->

                fs.writeFile '../tests/exprs.js', jsString, (err) ->

                        if err
                                console.log err
                        else
                                console.log 'saved'
