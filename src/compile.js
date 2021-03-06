var fs = require("fs"),
parse = require("./parse.js").parseFile,
treeToJs = require("./toJs.js").treeToJs;
var root = this,
args = process.argv;
var compile = function (file) {
return parse(file, function (err, parseTree) {
    return treeToJs.trans(parseTree, function (err, jsString) {
        return fs.writeFile((file.split(".eth")[0] + ".js"), jsString, function (err) {
            if (err) {
                return console.log(err);
            } else {
                return console.log(("Compiled " + file));
            }
        });
    });
});
};
root.compile = compile;
if (args[2]) {
compile(args[2]);
}
