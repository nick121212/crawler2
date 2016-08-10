let _ = require("lodash");

let regexs = {
    room: {
        regexp: /\/shanghai(?:\/list\/pa\d+|\/list\/s\d+(?:_b\d+|_pa\d+|_b\d+_pa\d+|)|\/\d+.html|)\/?$/i,
        data: [
            "http://esf.fangdd.com/shanghai",
            "http://esf.fangdd.com/shanghai/list/s994",
            "http://esf.fangdd.com/shanghai/list/s977_b5028",
            "http://esf.fangdd.com/shanghai/list/s977_pa12",
            "http://esf.fangdd.com/shanghai/list/s977_b998_pa6",
            "http://esf.fangdd.com/shanghai/list/r5",
            "http://esf.fangdd.com/shanghai/list/pa2",
            "http://esf.fangdd.com/shanghai/849313.html"
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