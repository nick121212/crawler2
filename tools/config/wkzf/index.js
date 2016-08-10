/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("wkzf", "www.wkzf.com", []);

    config.setBaseInfo(1000, "superagent");
    config.initDomain = "www.wkzf.com/shanghai/esf";
    config.proxySettings = {
        useProxy: false,
        charset: "utf-8",
        timeout: 5000
    };
    // 白名单
    config.addWhitePath(/^\/shanghai\/esf(?:\/\D+(?:-\D+|)(?:\/p\d+|)|\/detail\/.+\.html|)\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.wkzf.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};