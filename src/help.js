var fs = require("fs"),
util = require("util");
var objProto = Object.prototype,
arrProto = Array.prototype;
var nativeForEach = arrProto.forEach,
nativeMap = arrProto.map;
var _ = this;
_.log = function (n) {
return console.log(util.inspect(n, false, null));
};
_.eq = function (x, y) {
return JSON.stringify(x) === JSON.stringify(y);
};
_.key = function (obj) {
var k;
for (k in obj) {
    if (obj.hasOwnProperty(k)) {
        return k;
    }
}
return null;
};
_.val = function (obj) {
var k;
for (k in obj) {
    if (obj.hasOwnProperty(k)) {
        return obj[k];
    }
}
return null;
};
_.assert = function (mode) {
return function (x, y) {
    if (mode === "-v") {
        if (eq(x, y)) {
            return log(["Pass", x, y]);
        } else {
            return log(["Fail", x, y]);
        }
    } else {
        return log(eq(x, y));
    }
};
};
_.toStr = objProto.toString;
_.obArr = "[object Array]";
_.obObj = "[object Object]";
_.isComment = /^;.*/;
_.isStr = /^\"(([^\\]*?|(\\.))*?)\"/;
_.isSpace = /^\s+/;
_.isAtom = /^[^\;\"\n\t\(\)\[\]\{\}\s]+/;
_.isInt = /\d+/;
_.isSymbol = /^[\_|\|$A-z][\_|\|$A-z|\d]*/;
_.isRegex = /^\/([^\\]*?|(\\.))*?\/[img]*/;
_.isIn = function (e, arr) {
return arr.indexOf(e) >= 0;
};
_.map = function (ls, f, ctx) {
if ((nativeMap && (nativeMap === ls.map))) {
    return ls.map(f, ctx);
} else {
    var res = [],
        k = 0,
        len = ls.length;
    for (k = 0; k < len; k++) {
        res.push(f.call(ctx, ls[k], k, ls));
    }
    return res;
}
};
_.each = function (ls, f, ctx) {
if ((nativeForEach && (ls.forEach === nativeForEach))) {
    return ls.forEach(f, ctx);
} else {
    return (function () {
        var res_ = [];
        for (k in ls) {
            res_.push(f.call(ctx, ls[k], k, ls));
        }
        return res_;
    })();
}
};
_.pairize = function (arr) {
var odd = false,
    res = [];
_.each(arr, function (v, k) {
    if (odd) {
        res.push([arr[(k - 1)], v]);
        return odd = false;
    } else {
        return odd = true;
    }
});
return res;
};
_.partition = function (test, arr) {
var pass = [],
    fail = [];
_.each(arr, function (a) {
    if (test(a)) {
        return pass.push(a);
    } else {
        return fail.push(a);
    }
});
return [pass, fail];
};
