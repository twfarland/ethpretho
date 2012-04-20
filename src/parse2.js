var fs = require("fs");
var _ = require("./help.js");
var root = this;
// stackMutator :: expr, stack -> _ (mutates stack)
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
        return throw new Error("Parse error: " + JSON.stringify(stack));
    }
};
var deeper = function (expr, stack) {
    return stack.unshift(expr);
};
// matchers :: [[str expressor stackMutator]]
var matchers = [["comment", (function (str) {
    var chomp = _.isComment.exec(str);
    if (chomp) {
        return [{c: chomp[0].slice(1)}, chomp[0].length];
    }
})], ["string", (function (str) {
    var chomp = _.isStr.exec(str);
    if (chomp) {
        return [{c: chomp[0].slice(1, -1)}, chomp[0].length];
    }
})], ["space", (function (str) {
    var chomp = _.isSpace.exec(str);
    if (chomp) {
        return [{w: chomp[0]}, chomp[0].length];
    }
})], ["atom", (function (str) {
    var chomp = _.isAtom.exec(str);
    if (chomp) {
        return [{w: chomp[0]}, chomp[0].length];
    }
})], ["openexp", (function (str) {
    if (str === "(") {
        return [[], 1];
    }
}), deeper], ["closeexp", (function (str) {
    if (str === ")") {
        return [null, 1];
    }
}), involve], ["openarr", (function (str) {
    if (str === "[") {
        return [{a: []}, 1];
    }
}), deeper], ["closearr", (function (str) {
    if (str === "]") {
        return [null, 1];
    }
}), involve], ["openobj", (function (str) {
    if (str === "{") {
        return [{o: []}, 1];
    }
}), deeper], ["closeobj", (function (str) {
    if (str === "}") {
        return [null, 1];
    }
}), involve], ["nomatch", (function () {
    return [" ", 1];
})]];
// makeTree :: str, stack -> stack
// the stack accumulates syntax nodes as the str is consumed
var makeTree = function (str, stack) {
    while (str.length > 0) {
        for (k in matchers) {
            var m = matchers.k;
            var match = m[1](str);
            if (match) {
                (m[2] || defaultAlter)(stack);
                var str = str.slice(match[1]);
                break;
            }
        }
    }
    if (stack.length === 1) {
        return stack;
    } else {
        return throw new Error("Parse error: " + JSON.stringify(stack));
    }
};
// parseFile :: string, (err, data -> void)
var parseFile = function (file, callback) {
    return fs.readFile(file, "utf-8", function (err, data) {
        return callback(err, makeTree(data, [[]]));
    });
};
root.parseFile = parseFile;
