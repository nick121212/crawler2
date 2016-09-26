let _ = require("lodash");

let regexs = {
    room: {
        regexp: /\/ershoufang(?:\/\D+(?:\/d\d+|)|\/[a-z]{2}\d+\.html|)\/?$/i,
        data: [
            "http://sh.lianjia.com/ershoufang",
            "http://sh.lianjia.com/ershoufang/putuo/",
            "http://sh.lianjia.com/ershoufang/ganquanyichuan/",
            "http://sh.lianjia.com/ershoufang/ganquanyichuan/d6",
            "http://sh.lianjia.com/ershoufang/sh4183603.html",
            "http://sh.lianjia.com/ershoufang/ganquanyichuan/a4",
            "http://sh.lianjia.com/ershoufang/ganquanyichuan/a4/d6"
        ]
    },
    house: {
        regexp: /\/loupan(?:\/pg\d+|\/[a-z]*(?:\/pg\d+|)|\/[a-z]_.*|)\/?$/i,
        data: [
            "http://zs.fang.lianjia.com/loupan/",
            "http://zs.fang.lianjia.com/loupan/sanxiangzhen/",
            "http://zs.fang.lianjia.com/loupan/shiqiqu/",
            "http://zs.fang.lianjia.com/loupan/shiqiqu/pg2/",
            "http://zs.fang.lianjia.com/loupan/pg3/",
            "http://zs.fang.lianjia.com/loupan/wuguishanzhen/p2/"
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