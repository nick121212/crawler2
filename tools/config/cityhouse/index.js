/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = (core) => {
    let config = new core.utils.builder("cityhouse", "www.cityhouse.cn", [
        "sh.cityhouse.cn"
    ]);

    config.setBaseInfo(2000, "superagent");
    config.initDomain = "sh.cityhouse.cn/ha";
    config.proxySettings = {
        useProxy: false || process.env.ENV == "production",
        timeout: 10000,
        charset: "utf-8",
        errorInterval: 2,
        ipInfo: {
            host: "114.55.146.215",
            port: "8083"
        },
        images: "/data/images/anjuke/"
    };

    // 匹配小区列表页，小区详情页,户型图页（只根据区域版块过滤）
    config.addWhitePath(/^\/ha(?:\/pg\d+|)\/?$/);

    _.forEach(core.config.cityhouse.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};