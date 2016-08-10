/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("iwjw", "www.iwjw.com", []);

    config.setBaseInfo(1000, "superagent");
    config.initDomain = "www.iwjw.com/sale/shanghai";
    config.proxySettings = {
        useProxy: false,
        charset: "utf-8",
        timeout: 5000
    };
    // 白名单
    config.addWhitePath(/\/sale(?:\/shanghai\/(g1|g2)(?:id\d+|)(p\d+)?|\/([1-9]|[a-z]|[A-Z])+|shanghai)\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.iwjw.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};