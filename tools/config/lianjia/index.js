/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("lianjia", "www.lianjia.com", [
        "sh.lianjia.com",
        "sh.fang.lianjia.com",
        "bj.lianjia.com",
        "cd.lianjia.com",
        "dl.lianjia.com",
        "fs.lianjia.com",
        "nj.lianjia.com",
        "su.lianjia.com",
        "wx.fang.lianjia.com",
        "sh.lianjia.com",
        "tj.lianjia.com",
        "cq.lianjia.com",
        "xa.fang.lianjia.com",
        "sy.fang.lianjia.com",
        "sz.lianjia.com",
        "zs.fang.lianjia.com",
        "cs.lianjia.com",
        "qd.lianjia.com",
        "sjz.fang.lianjia.com",
        "wh.lianjia.com",
        "yt.fang.lianjia.com",
        "hz.lianjia.com",
        "jn.lianjia.com",
        "jx.fang.lianjia.com",
        "lin.fang.lianjia.com",
        "xm.lianjia.com",
        "wf.fang.lianjia.com",
        "wz.fang.lianjia.com",
        "xz.fang.lianjia.com",
        "yz.fang.lianjia.com"
    ]);

    config.setBaseInfo(5000, "phantom");
    config.initDomain = "sh.lianjia.com";
    config.limitMinLinks = 50;
    config.stripWWWDomain = false;
    config.proxySettings = {
        useProxy: true && process.env.ENV == "production",
        charset: "utf-8",
        timeout: 5000,
        errorInterval: 5,
        ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36",
        // wait: 1000,
        ipInfo: {
            host: "10.25.254.241",
            port: "8081"
        }
    };

    // 二手房
    // config.addWhitePath(/^\/ershoufang(?:\/\D+(?:\/d\d+|)|\/[a-z]{2}\d+\.html|)\/?$/);
    // 匹配小区列表，小区详情页，小区版块列表（只按照区域和版块过滤）
    config.addWhitePath(/^\/xiaoqu(?:\/[a-z]*\/?(?:d\d+\/?|\/?)|\/?|\/\d+.html)$/);
    // 楼盘
    config.addWhitePath(/^\/list\/pg\d+/);

    // -----------------页面配置------------------
    _.forEach(core.config.lianjia.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};