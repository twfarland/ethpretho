var fs = require("fs"),
util = require("util"),
parse = require("./parse.js"),
_ = require("./help.js");
var root = this;
var toStr = _.toStr,
obArr = _.obArr,
obObj = _.obObj,
log = _.log,
isInt = _.isInt,
isSymbol = _.isSymbol,
pairize = _.pairize,
partition = _.partition,
isIn = _.isIn,
map = _.map,
each = _.each;
var treeToJs = function (extra) {
if (extra == null) {
    extra = {};
}
var branchers = ["if", "try"],
    blockCreators = branchers.concat(["for", "while"]),
    noWrap = ["", "=", "()", "return", "throw", "new", "for"],
    openSpace = ["->", ""];
var isFirstIn = function (set) {
    return function (e) {
        return (e[0] && isIn(e[0], set));
    };
};
var isBrancher = isFirstIn(branchers),
    isBlockCreator = isFirstIn(blockCreators);
var sBlock = function (sep) {
    return function (exprs, p, i) {
        if (exprs.length === 0) {
            return "()";
        } else {
            return ("(" + map(exprs, function (e) {
                return toJs(e, "()", i);
            }).join(sep) + ")");
        }
    };
};
var argBlock = sBlock(", "),
    iniBlock = sBlock("; ");
var prepBranch = function (e) {
    if ((e[0] && (e[0] === ","))) {
        return e.slice(1);
    } else {
        return [e];
    }
};
var getIndent = function (i) {
    var res = "";
    while (i > 1) {
        res += "    ";
        i--;
    }
    return res;
};
var getSemi = function (e) {
    if ((isBlockCreator(e) || e.c)) {
        return "";
    } else {
        return ";";
    }
};
var getRef = function (e, i) {
    if ((((typeof e) === "string") && isSymbol.exec(e))) {
        return ("." + e);
    } else if (((toStr.call(e) === obObj) && (_.key(e) === "a"))) {
        return ("[" + toJs(e.a[0], ".", i) + "]");
    } else {
        return ("[" + toJs(e, ".", i) + "]");
    }
};
var wrap = function (res, p) {
    if (isIn(p, noWrap)) {
        return res;
    } else {
        return ("(" + res + ")");
    }
};
var selfCollect = function (e, p, i) {
    var pre = e.slice(0, -1),
        last = e.slice(-1);
    return wrap(toJs([["->", [], [":=", "res_", {a: []}], pre.concat([["res_.push", last[0]]]), "res_"]], p, i), e[0]);
};
var prim = {":=": (function (e, p, i) {
    if (e.length > 2) {
        return ("var " + prim['='](e, p, i));
    } else {
        return ("var " + e[1]);
    }
}), "=": (function (e, p, i) {
    if (! e[2]) {
        return toJs(e[1], "=", i);
    } else {
        return map(pairize(e.slice(1)), function (pair) {
            return (toJs(pair[0], "=", i) + " = " + toJs(pair[1], "=", i));
        }).join((",\n" + getIndent(i)));
    }
}), ".": (function (e, p, i) {
    var mem = e[1];
    var res = toJs(mem, ".", i);
    var parts = e.slice(2);
    each(parts, function (part) {
        if ((typeof part) === "string") {
            return res += getRef(part, i);
        } else if (toStr.call(part) === obArr) {
            if (prim[part[0]]) {
                return res += ("[" + prim[part[0]](part, ".", i) + "]");
            } else {
                return res += (getRef(part[0], i) + argBlock(part.slice(1), ".", i));
            }
        } else if (toStr.call(part) === obObj) {
            if (_.key(part) === "s") {
                return res += ("['" + part.s + "']");
            } else if (_.key(part) === "a") {
                if (part.a.length === 2) {
                    return res += (".slice" + argBlock(part.a.slice(0, 2), "slice", i));
                } else {
                    return res += ("[" + toJs(part.a[0], ".", i) + "]");
                }
            }
        } else {
            throw new Error("Invalid reference");
        }
    });
    return res;
}), "->": (function (e, p, i) {
    var res = ("function (" + e[1].join(", ") + ") " + block(e.slice(2), "->", i));
    if (p === "") {
        return ("(" + res + ")");
    } else {
        return wrap(res, p);
    }
}), "throw": (function (e, p, i) {
    return ("throw " + toJs(e[1], "throw", i));
}), "return": (function (e, p, i) {
    return ("return " + toJs(e[1], "return", i));
}), "?": (function (e, p, i) {
    return wrap((toJs(e[1], "()", i) + " ? " + toJs(e[2], "()", i) + " : " + toJs(e[3], "()", i)), p);
}), "if": (function (e, p, i) {
    if (isIn(p, openSpace)) {
        var prd = e.slice(1);
        var res = ("if (" + toJs(prd[0], "()", i) + ") " + block(prepBranch(prd[1]), p, i));
        prd.splice(0, 2);
        while (prd.length !== 0) {
            if (prd.length === 1) {
                res += (" else " + block(prepBranch(prd[0]), p, i));
                prd.splice(0, 1);
            } else {
                res += (" else if (" + toJs(prd[0], "()", i) + ") " + block(prepBranch(prd[1]), p, i));
                prd.splice(0, 2);
            }
        }
        return res;
    } else {
        if (e.length === 4) {
            return toJs(["?"].concat(e.slice(1)), p, i);
        } else {
            return wrap(toJs([["->", [], e]], p, i), "if");
        }
    }
}), "try": (function (e, p, i) {
    if (isIn(p, openSpace)) {
        var res = ("try " + block(prepBranch(e[2]), p, i));
        if (e[3]) {
            res += (" catch (" + toJs(e[1], "()", i) + ") " + block(prepBranch(e[3]), p, i));
        }
        if (e[4]) {
            res += (" finally " + block(prepBranch(e[4]), p, i));
        }
        return res;
    } else {
        return wrap(toJs([["->", [], e]], p, i), "try");
    }
}), "while": (function (e, p, i) {
    if (isIn(p, openSpace)) {
        return ("while " + iniBlock([e[1]], "while", i) + " " + block(e.slice(2), "", i));
    } else {
        return selfCollect(e, p, i);
    }
}), "for": (function (e, p, i) {
    if (isIn(p, openSpace)) {
        return ("for " + iniBlock(e[1], "for", i) + " " + block(e.slice(2), "", i));
    } else {
        return selfCollect(e, p, i);
    }
})};
var binaryPr = function (sym) {
    return function (e, p, i) {
        return wrap(map(e.slice(1), function (e_) {
            return toJs(e_, sym, i);
        }).join((" " + sym + " ")), p);
    };
};
var binaryAlwaysWrap = function (sym) {
    return function (e, p, i) {
        return wrap(map(e.slice(1), function (e_) {
            return toJs(e_, sym, i);
        }).join((" " + sym + " ")), "wrap");
    };
};
var binaryChain = function (sym) {
    return function (e, p, i) {
        if (e.length > 3) {
            var left = e[1],
                res = ["&&"];
            each(e.slice(2), function (e_, k) {
                res.push([sym, left, e_]);
                return left = e_;
            });
            return toJs(res, p, i);
        } else {
            return wrap((toJs(e[1], sym, i) + " " + sym + " " + toJs(e[2], sym, i)), p);
        }
    };
};
var unaryPost = function (sym) {
    return function (e, p, i) {
        return wrap((e[1] + sym), p);
    };
};
var unaryPr = function (sym) {
    return function (e, p, i) {
        if (e.length < 3) {
            var arg = e[1];
        } else {
            var arg = e.slice(1);
        }
        return wrap((sym + " " + toJs(arg, p, i)), p);
    };
};
var placePrim = function (func, ls) {
    return each(ls, function (op) {
        return prim[op] = func(op);
    });
};
placePrim(binaryPr, ["+=", "*=", "/=", "%=", "-=", "<<=", ">>=", ">>>=", "&=", "^=", "|="]);
placePrim(binaryAlwaysWrap, ["*", "/", "%", "+", "-", "&&", "||", ","]);
placePrim(binaryChain, ["==", "!=", "===", "!==", ">", ">=", "<", "<=", "in", "of", "instanceof"]);
placePrim(unaryPost, ["++", "--"]);
placePrim(unaryPr, ["typeof", "new", "throw", "!"]);
each(extra, function (v, k) {
    return prim.k = v;
});
var block = function (exprs, p, i) {
    i = (i || 0);
    var pre = exprs.slice(0, -1),
        last = exprs.slice(-1),
        ind = getIndent(i),
        i_ = (i + 1),
        res = "{\n";
    if (pre.length > 0) {
        each(pre, function (e) {
            return res += (ind + toJs(e, "", i_) + getSemi(e) + "\n");
        });
    }
    if (last.length === 1) {
        res += ind;
        var e = last[0];
        if (isBrancher(e)) {
            res += (toJs(e, p, i_) + getSemi(e));
        } else if (p === "->") {
            if ((e[0] && (e[0] === "throw"))) {
                res += ("throw " + toJs(e[1], "throw", i_) + getSemi(e));
            } else {
                res += (toJs(["return", e], p, i_) + ";");
            }
        } else {
            res += (toJs(e, p, i_) + getSemi(e));
        }
    }
    return (res + "\n" + getIndent((i - 1)) + "}");
};
var toJs = function (expr, p, i) {
    if (p == null) {
        p = "";
    }
    if ((typeof expr) === "string") {
        return expr;
    } else if (toStr.call(expr) === obArr) {
        var first = expr[0];
        if (first) {
            if (prim[first]) {
                return prim[first](expr, p, i);
            } else {
                return (toJs(first, "", i) + argBlock(expr.slice(1), first, i));
            }
        } else {
            return "";
        }
    } else {
        var exprKey = _.key(expr);
        if (exprKey === "s") {
            return ("\"" + expr.s + "\"");
        } else if (exprKey === "a") {
            return ("[" + map(expr.a, function (e) {
                return toJs(e, "[]", i);
            }).join(", ") + "]");
        } else if (exprKey === "o") {
            var pairs = pairize(expr.o);
            return ("{" + map(pairs, function (pair) {
                return (toJs(pair[0], "{}", i) + ": " + toJs(pair[1], "{}", i));
            }).join(", ") + "}");
        } else if (exprKey === "c") {
            return ("//" + expr.c);
        } else {
            throw new Error(("Unhandled case: " + util.inspect(expr)));
        }
    }
};
this.toJs = toJs;
this.block = block;
this.trans = function (tree, callback) {
    return callback(null, block(tree[0], "", 0).slice(2, -1));
};
return this;
};
root.treeToJs = new treeToJs();
