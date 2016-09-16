let _ = require("lodash");

let regexs = {
    loupan: {
        // regexp: /\/loupan(?:\/?|\/(?:[a-z]*(?:\/p\d+\/?|\/?))|\/(?:canshu|huxing|xiangce|)-?\d+\/?(?:ybj|sjt|xgt|ght|ptt|wzt|)\.html)$/i,
        regexp: /\/ha(?:\/pg\d+|\/(.*?)\.html|)\/?$/i,
        data: [
            "http://sh.cityhouse.cn/ha/",
            "http://sh.cityhouse.cn/ha/pg2/",
            "http://sh.cityhouse.cn/ha/0003966106.html"
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