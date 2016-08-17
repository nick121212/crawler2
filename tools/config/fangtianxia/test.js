let _ = require("lodash");

let regexs = {
    jjr: {
        regexp: /\/agenthome(?:-a0\d+(?:-b0\d+|)\/-i\d+-j310|)\/?$/i,
        data: [
            "http://esf.sh.fang.com/agenthome/",
            "http://esf.sh.fang.com/agenthome-a025/-i31-j310/",
            "http://esf.sh.fang.com/agenthome-a025-b05235/-i31-j310/",
            "http://esf.sh.fang.com/agenthome-a024-b01630/-h30-i31-j310-z61/",
            "http://esf.sh.fang.com/agenthome-a024-b01630/-h30-i31-j310-z63/",
            "http://esf.sh.fang.com/agenthome-a024-b01630/-h30-i31-j310-z63-j5%b8%df%b6%cb%ce%ef%d2%b5/"
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