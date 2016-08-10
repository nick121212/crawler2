let _ = require("lodash");

let regexs = {
    loupan: {
        regexp: /\/shanghai\/newhouse\/(?:index|detail\/\d+|loudetail\/\d+)\/?$/i,
        data: [
            "http://www.fangjiadp.com/shanghai/newhouse/index/",
            "http://www.fangjiadp.com/shanghai/newhouse/detail/533216",
            "http://www.fangjiadp.com/shanghai/newhouse/loudetail/533216"
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