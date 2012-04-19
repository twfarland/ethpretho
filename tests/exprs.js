1 + ((function () {
    if (1) {
        return 2;
    } else if (3) {
        return 4;
    } else {
        return ((function () {
            var res_ = [];
            for (i in y) {
                res_.push(y * 2);
            }
            return res_;
        })())
    }
})());
