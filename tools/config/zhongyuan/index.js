/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("zhongyuan", "sh.centanet.com", ["sh.centanet.com"]);

    config.setBaseInfo(1000, "phantom");
    config.initDomain = "sh.centanet.com/xiaoqu/g1";
    config.proxySettings = {
        useProxy: false,
        charset: "utf-8",
        wait: 3000,
        timeout: 5000
    };
    // 白名单
    // config.addWhitePath(/^\/ershoufang(?:\/\D+|\/.+\.html|)(?:|\/g\d+)\/?$/);

    config.addWhitePath(/^\/xiaoqu\/g\d+\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.zhongyuan.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};