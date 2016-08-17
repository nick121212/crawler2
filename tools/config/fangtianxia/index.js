let _ = require("lodash");

module.exports = exports = (core) => {
    let config = new core.utils.builder("fangtianxia", "www.fang.com", ["esf.sh.fang.com"]);

    config.setBaseInfo(1000, "superagent");
    config.initDomain = "esf.sh.fang.com/agenthome";
    config.allowQueryParams = ["pg"];
    // config.stripWWWDomain = false;
    // config.stripQuerystring = false;
    config.proxySettings = {
        useProxy: false,
        charset: "GBK",
        timeout: 5000
    };
    // 白名单
    // 二手房正则
    config.addWhitePath(/^\/agenthome(?:-a0\d+(?:-b0\d+|)\/-i\d+-j310|)\/?$/);

    // -----------------页面配置------------------
    _.forEach(core.config.fangtianxia.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};