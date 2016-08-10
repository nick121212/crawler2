let _ = require("lodash");

let regexs = {
    room: {
        regexp: /\/ershoufang(?:\/\D+|\/.+\.html|)(?:|\/g\d+)\/?$/i,
        data: [
            "http://sh.centanet.com/ershoufang",
            "http://sh.centanet.com/ershoufang/huangpuqu/g5/",
            "http://sh.centanet.com/ershoufang/huangpuqu/",
            "http://sh.centanet.com/ershoufang/g5/",
            "http://sh.centanet.com/ershoufang/huangpuqu/p4/",
            "http://sh.centanet.com/ershoufang/5b91f204-0e0b-4a2e-86cb-d71033572422.html"
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