let _ = require("lodash");

let regexs = {
    room: {
        regexp: /\/sale(?:\/shanghai\/(g1|g2)(?:id\d+|)(p\d+)?|\/([1-9]|[a-z]|[A-Z])+|shanghai)\/?$/i,
        data: [
            "http://www.iwjw.com/sale/shanghai/",
            "http://www.iwjw.com/sale/shanghai/g1id8/",
            "http://www.iwjw.com/sale/shanghai/g2id1210/",
            "http://www.iwjw.com/sale/shanghai/g2id1210p21/",
            "http://www.iwjw.com/sale/shanghai/g1id7p100/",
            "http://www.iwjw.com/sale/shanghai/g1/",
            "http://www.iwjw.com/sale/shanghai/g1id7ip4/",
            "http://www.iwjw.com/sale/shanghai/g1id7ip4rn5/",
            "http://www.iwjw.com/sale/jqBUO15VFtQ"
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