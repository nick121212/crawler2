// http://www.fangjiadp.com/shanghai/newhouse/loudetail/658917

/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("fangjiadp", "www.fangjiadp.com", []);

    config.setBaseInfo(1000, "phantom");
    config.initDomain = "www.fangjiadp.com/shanghai/newhouse/index";
    config.allowQueryParams = ["pg"];
    config.stripWWWDomain = false;
    config.stripQuerystring = false;
    config.proxySettings = {
        useProxy: false,
        charset: "utf-8",
        timeout: 5000
    };
    // 白名单
    // 二手房正则
    config.addWhitePath(/^\/shanghai\/newhouse\/(?:index|detail\/\d+|loudetail\/\d+)\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.fangjiadp.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};