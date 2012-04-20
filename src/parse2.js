var fs = require("fs");
var _ = require("./utils.js");
var toStr = {}.toString;
var obArr = "[object Array]";
// stackMutator :: expr, stack -> _ (mutates stack)
var defaultAlter = function (expr, stack) {
    var lower = stack[0];
    if (toStr.call(lower) === obArr) {
        return lower.push(expr);
    } else {
        return val(lower).push(expr);
    }
};
var involve = function (expr, stack) {
    try {
        expr = stack.take();
        return defaultAlter(expr, stack);
    } catch (e) {
        return throw new Error("Parse error: " + JSON.stringify(stack));
    }
};
var deeper = function (expr, stack) {
    return stack.put(expr);
};
// matchers :: [[str expressor stackMutator]]
var matchers = [["comment", (function (str) {
    if (str[0] === ";") {
        var res = "";
        var rest = str.slice(0, 1);
        for (r in rest) {
            var c = rest[r];
            if (c === "\n") {
                break;
            } else {
                res += c;
            }
        }
        return [{c: res}, (res.length + 2)];
    }
})], ["string", (function (str) {
    if (str[0] === "\"") {
        var res = "";
        var rest = str.slice(0, 1);
        return ((function () {
            var res_ = [];
            for (r in rest) {
                var c = rest[r];
                res_.push((c === "\"") && /^\\/.exec(rest[(r - 1)]) ? break : res += c);
            }
            return res_;
        })())
    } else {
        return [{s: res}, (res.length + 2)];
    }
})]];
