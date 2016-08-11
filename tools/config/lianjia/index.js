/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("lianjia", "www.lianjia.com", ["sh.lianjia.com", "sh.fang.lianjia.com"]);

    config.setBaseInfo(5000, "phantom");
    config.initDomain = "sh.lianjia.com";
    config.proxySettings = {
        useProxy: false && process.env.ENV == "production",
        charset: "utf-8",
        timeout: 5000,
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
    // config.addWhitePath(/^\/list\/pg\d+/)

    // -----------------页面配置------------------
    _.forEach(core.config.lianjia.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};