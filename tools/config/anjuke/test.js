let _ = require("lodash");

let regexs = {
    loupan: {
        regexp: /\/loupan(?:\/?|\/(?:[a-z]*(?:\/p\d+\/?|\/?))|\/(?:canshu|huxing|xiangce|)-?\d+\/?(?:ybj|sjt|xgt|ght|ptt|wzt|)\.html)$/i,
        data: [
            "http://sh.fang.anjuke.com/loupan/all/p3/",
            "http://sh.fang.anjuke.com/loupan/all/",
            "http://sh.fang.anjuke.com/loupan/jiading/",
            "http://sh.fang.anjuke.com/loupan/jiading/p2/",
            "http://sh.fang.anjuke.com/loupan/p2/",
            "http://sh.fang.anjuke.com/loupan/j2/",
            "http://sh.fang.anjuke.com/loupan/3748734634.html",
            "http://sh.fang.anjuke.com/loupan/canshu-3748734634.html",
            "http://sh.fang.anjuke.com/loupan/huxing-3748734634.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-3748734634.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/ybj.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/sjt.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/xgt.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/ght.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/ptt.html",
            "http://sh.fang.anjuke.com/loupan/xiangce-131001/wzt.html"
        ]
    },
    community: {
        regexp: /\/community\/?(?:[a-z]*(?:\/p\d+\/?|\/?)|\/view\/\d+|photos\/model\/\d+|photos2\/b\/\d+(.+Z\d+)?)\/?$/i,
        data: [
            "http://shanghai.anjuke.com/community",
            "http://shanghai.anjuke.com/community/",
            "http://shanghai.anjuke.com/community/pudong/",
            "http://shanghai.anjuke.com/community/pudong/p3/",
            "http://shanghai.anjuke.com/community/pudong/o2/",
            "http://shanghai.anjuke.com/community/view/13235",
            "http://shanghai.anjuke.com/community/view/13235/",
            "http://shanghai.anjuke.com/community/photos/model/13235",
            "http://shanghai.anjuke.com/community/photos2/b/8",
            "http://shanghai.anjuke.com/community/photos2/b/8W0QQpZ2",
            "http://shanghai.anjuke.com/community/photos/model/8"
        ]
    },
    broker: {
        regexp: /\/tycoon(?:\/p\d+|)\/?$/i,
        data: [
            "http://shanghai.anjuke.com/tycoon/",
            "http://shanghai.anjuke.com/tycoon/pudong/",
            "http://shanghai.anjuke.com/tycoon/pudong/p2",
            "http://shanghai.anjuke.com/tycoon/j2",
            "http://shanghai.anjuke.com/tycoon/p2",
            "http://dulijingjiren11.anjuke.com/gongsi-jjr-9906/js/",
            "http://dulijingjiren11.anjuke.com/gongsi-jjr-9906/js",
            "http://huanxindichan.anjuke.com/gongsi-jjr-21890/",
            "http://shenzhoufangcha.anjuke.com/gongsi-jjr-13622/",
            "http://zhushangbudongc.anjuke.com/gongsi-jjr-11157/",
            "http://dulijingjiren11.anjuke.com/gongsi-jjr-9906/",
            "http://woaiwojia19.anjuke.com/gongsi-jjr-33388/",
            "http://changyuandichan.anjuke.com/gongsi-jjr-4137/",
            "http://fumeilai.anjuke.com/gongsi-jjr-1782/",
            "http://jiaxinfangchan.anjuke.com/gongsi-jjr-454/",
            "http://dulijingjiren11.anjuke.com/gongsi-jjr-9906/",
            "http://hengtongdichan.anjuke.com/gongsi-jjr-5558/",
            "http://hanchangfangcha1.anjuke.com/gongsi-jjr-23350/"
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