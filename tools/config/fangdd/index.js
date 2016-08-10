/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("fangdd", "esf.fangdd.com", []);

    config.setBaseInfo(1000, "superagent");
    config.initDomain = "esf.fangdd.com/shanghai";
    config.proxySettings = {
        useProxy: false,
        charset: "utf-8",
        timeout: 5000
    };
    // 白名单
    // 二手房正则
    config.addWhitePath(/^\/shanghai(?:\/list\/pa\d+|\/list\/s\d+(?:_b\d+|_pa\d+|_b\d+_pa\d+|)|\/\d+.html|)\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.fangdd.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};