let _ = require("lodash");

let regexs = {
    room: {
        regexp: /\/shanghai\/esf(?:\/\D+(?:-\D+|)(?:\/p\d+|)|\/detail\/.+\.html|)\/?$/i,
        data: [
            "http://www.wkzf.com/shanghai/esf",
            "http://www.wkzf.com/shanghai/esf/jinganqu",
            "http://www.wkzf.com/shanghai/esf/jinganqu/p4",
            "http://www.wkzf.com/shanghai/esf/jinganqu-zhongshanbeilu",
            "http://www.wkzf.com/shanghai/esf/jinganqu-nanjingxilu/p2",
            "http://www.wkzf.com/shanghai/esf/detail/dfd27d4d4907f79a.html",
            "http://www.wkzf.com/shanghai/esf/l10",
            "http://www.wkzf.com/shanghai/esf/l10/s5",
            "http://www.wkzf.com/shanghai/esf/l10/d1-s5"
        ]
    }
};

let keyV = regexs[process.argv[2]];

if (!keyV) return;

for (let key in keyV.data) {
    let data = keyV.data[key];
    let regex = keyV.regexp;

    console[regex.test(data) ? "log" : "error"](data, "-------", regex.test(data));
}