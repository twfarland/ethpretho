var root = this;
var toString = {}.toString;
var isArray = Array.isArray || function (elem) {
    return toString.call(elem) === "[object Array]";
};
var isObject = function (x) {
    return toString.call(x) === "[object Object]";
};
var Don = function () {
    var inner = function (arr) {
        var res = "";
        var e;
        for (e in arr) {
            var elem = arr[e];
            res += (function () {
                if (isArray(elem)) {
                    return toHtml(elem);
                } else {
                    return elem;
                }
            }());
        }
        return res;
    };
    var attrs = function (obj) {
        var res = "";
        var k;
        for (k in obj) {
            var val = obj[k];
            res += (" " + k + "=\"" + val + "\"");
        }
        return res;
    };
    var toHtml = function (arr) {
        if (arr.length === 0) {
            return "";
        } else if (isArray(arr[0])) {
            var res = "";
            for (e in arr) {
                res += toHtml(arr[e]);
            }
            return res;
        } else if (arr.length === 1) {
            return "<" + arr[0] + ">";
        } else if (isObject(arr[1])) {
            arr.length === 2;
            "<" + arr[0] + attrs(arr[1]) + ">";
            return "<" + arr[0] + attrs(arr[1]) + ">" + inner(arr.slice(0, 2)) + "</" + arr[0] + ">";
        } else {
            return "<" + arr[0] + inner(arr.slice(0, 1)) + "</" + arr[0] + ">";
        }
    };
    this.toHtml = toHtml;
    this.render = function (data, template, key) {
        return toHtml(template(data, key));
    };
    return this;
};
root.Don = new Don();
