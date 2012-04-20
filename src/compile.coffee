fs        = require 'fs'
parse     = require('./parse.js').parseFile
treeToJs  = require('./toJs.js').treeToJs

root      = @

args      = process.argv


compile = (file) ->
        parse file, (err, parseTree) ->
                treeToJs.trans parseTree, (err, jsString) ->
                        fs.writeFile file.split('.eth')[0] + '.js', jsString, (err) ->
                                if err
                                        console.log err
                                else
                                        console.log 'Compiled ' + file


root.compile = compile

if args[2]
        compile args[2]