var fs = require("fs"),
_ = require("./help.js");
var root = this;
var defaultAlter = function (expr, stack) {
var lower = stack[0];
if (_.toStr.call(lower) === _.obArr) {
    return lower.push(expr);
} else {
    return _.val(lower).push(expr);
}
};
var involve = function (expr, stack) {
try {
    expr = stack.shift();
    return defaultAlter(expr, stack);
} catch (e) {
    throw new Error(("Parse error: " + JSON.stringify(stack)));
}
};
var deeper = function (expr, stack) {
return stack.unshift(expr);
};
var matchers = [["string", (function (str) {
var chomp = _.isStr.exec(str);
if (chomp) {
    return [{s: chomp[0].slice(1, -1)}, chomp[0].length];
}
})], ["atom", (function (str) {
var chomp = (_.isRegex.exec(str) || _.isAtom.exec(str));
if (chomp) {
    return [chomp[0], chomp[0].length];
}
})], ["comment", (function (str) {
var chomp = _.isComment.exec(str);
if (chomp) {
    return [{c: chomp[0].slice(1)}, chomp[0].length];
}
}), (function (expr, stack) {
return false;
})], ["space", (function (str) {
var chomp = _.isSpace.exec(str);
if (chomp) {
    return [{w: chomp[0]}, chomp[0].length];
}
}), (function (expr, stack) {
return false;
})], ["openexp", (function (str) {
if (str[0] === "(") {
    return [[], 1];
}
}), deeper], ["closeexp", (function (str) {
if (str[0] === ")") {
    return [null, 1];
}
}), involve], ["openarr", (function (str) {
if (str[0] === "[") {
    return [{a: []}, 1];
}
}), deeper], ["closearr", (function (str) {
if (str[0] === "]") {
    return [null, 1];
}
}), involve], ["openobj", (function (str) {
if (str[0] === "{") {
    return [{o: []}, 1];
}
}), deeper], ["closeobj", (function (str) {
if (str[0] === "}") {
    return [null, 1];
}
}), involve], ["nomatch", (function () {
return [" ", 1];
})]];
var makeTree = function (str, stack) {
str += "\n";
var m;
var match;
var mlen = matchers.length,
    i = 0;
while (str.length !== 0) {
    for (i = 0; i < mlen; i++) {
        m = matchers[i];
        match = m[1](str);
        if (match) {
            (m[2] || defaultAlter)(match[0], stack);
            str = str.slice(match[1]);
            break;
        }
    }
}
if (stack.length === 1) {
    return stack;
} else {
    throw new Error(("Parse error: " + JSON.stringify(stack)));
}
};
var parseFile = function (file, callback) {
return fs.readFile(file, "utf-8", function (err, data) {
    return callback(err, makeTree(data, [[]]));
});
};
root.parseFile = parseFile;
