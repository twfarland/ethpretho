x.y.z;
x[0];
x["y z"];
x[0];
x["y"];
x[y];
x.y(z).a(b);
x.slice(0, 1);
x[y(z)].u;
x[0](1);
x[0](1);
x["wat"](1);
x[y(z)](3);
(function () {
    if (1) {
        return 2;
    } else if (4) {
        return 3;
    }
}()).select("body").selectAll("p").data([4, 8, 15, 16, 23, 42]).enter().append("p").text(function (d) {
    return "I'm number " + d + "!";
});
1 + (function () {
    if (1) {
        return 2;
    } else if (3) {
        return 4;
    }
}());
1 + function () {
    return 2;
}();
x[(1 ? 2 : 3)];
x[(1 ? 2 : 3)](4);
x[(function () {
    if (1) {
        return 2;
    } else if (3) {
        return 6;
    }
}())](4);
function () {
    return 4;
}()[(function () {
    return 5;
})]();
