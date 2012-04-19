1;
"string";
symbol;
1234.50;
/regex/g;
// comment
[1, 2, 3];
{a: 1, b: 2};
{"a b": 1, "x y": 2};
(function (n) {
    return n * 2;
});
(function () {

})();
1 + 2;
-1;
x++;
1 + (2 - -1);
"a" + "b" + "c";
var x = 1;
x = 2;
var d = function (n) {
    return n * 2;
};
var d = function (n) {
    n = n + 1;
    return n * 2;
};
x , y , z;
x ? y : z;
if (x) {
    y;
}
if (x) {
    y;
} else {
    z;
}
if (x) {
    y;
} else if (a) {
    b;
}
if (x) {
    y;
} else if (a) {
    b;
} else {
    c;
}
if (x) {
    y;
    z;
} else {
    a;
    b;
}
if (x) {
    y;
    z;
} else if (y) {
    a;
    b;
} else {
    c;
    d;
}
if (x === a) {
    b;
}
if (x === a) {
    b;
} else {
    c;
}
if (x === a) {
    b;
} else if (x === c) {
    d;
} else {
    e;
}
if (x === a) {
    b;
    c;
} else if (x === d) {
    e;
}
if (x === a) {
    if (a === b) {
        c;
    }
} else {
    d;
}
try {
    x;
}
try {
    x;
} catch (e) {
    y;
}
try {
    x;
} catch (e) {
    y;
} finally {
    z;
}
try {
    x;
    y;
} catch (e) {
    x(e);
    y(e);
} finally {
    z();
}
1 + ((function () {
    if (x) {
        return y;
    }
})());
1 + (x ? y , z : a , b);
1 + ((function () {
    if (x === a) {
        return b;
    }
})());
1 + (x === a ? ((function () {
    if (a === b) {
        return c;
    }
})()) : d);
1 + ((function () {
    try {
        return x;
    }
})());
1 + ((function () {
    try {
        x;
        return y;
    } catch (e) {
        x(e);
        return y(e);
    } finally {
        return z();
    }
})());
(function () {
    if (x) {
        return y;
    }
});
(function () {
    x;
    if (x) {
        return y;
    }
});
(function () {
    if (x) {
        y;
    }
    return x;
});
(function () {
    if (x) {
        y;
        return z;
    } else if (y) {
        a;
        return b;
    } else {
        if (e) {
            return f;
        } else if (g) {
            return h;
        }
    }
});
(function () {
    if (x === a) {
        return b;
    }
});
(function () {
    x;
    if (x === a) {
        return b;
    }
});
(function () {
    if (x === a) {
        b;
    }
    return x;
});
(function () {
    if (x === a) {
        if (a === b) {
            return c;
        }
    } else {
        return d;
    }
});
(function () {
    try {
        return x;
    }
});
(function () {
    x;
    try {
        return x;
    }
});
(function () {
    try {
        x;
    }
    return x;
});
(function () {
    try {
        x;
        return y;
    } catch (e) {
        x(e);
        return y(e);
    } finally {
        return z();
    }
});
for (i in x) {
    j + i;
}
for (i = 0; i < 10; i++) {
    j + i;
}
1 + ((function () {
    var res_ = [];
    for (i in x) {
        res_.push(j + i);
    }
    return res_;
})());
1 + ((function () {
    var res_ = [];
    for (i in x) {
        y = z;
        res_.push(j + i);
    }
    return res_;
})());
(function () {
    return ((function () {
        var res_ = [];
        for (i in x) {
            res_.push(j + i);
        }
        return res_;
    })())
});
(function () {
    x;
    return ((function () {
        var res_ = [];
        for (i in x) {
            res_.push(j + i);
        }
        return res_;
    })())
});
(function () {
    for (i in x) {
        j + i;
    }
    return x;
});
(function () {
    return ((function () {
        var res_ = [];
        for (i in x) {
            y = z;
            res_.push(j + i);
        }
        return res_;
    })())
});
//while
//membership variations
