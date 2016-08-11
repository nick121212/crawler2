/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = (core) => {
    let config = new core.utils.builder("anjuke", "www.anjuke.com", [
        "sh.fang.anjuke.com",
        "shanghai.anjuke.com"
    ]);

    config.setBaseInfo(1000, "superagent");
    config.initDomain = "shanghai.anjuke.com";
    config.proxySettings = {
        useProxy: process.env.ENV == "production",
        timeout: 10000,
        charset: "utf-8",
        ipInfo: {
            host: "10.25.254.241",
            port: "8081"
        }
    };
    // 白名单

    // 楼盘列表、分页、相册,户型
    config.addWhitePath(/^\/loupan(?:\/?|\/(?:[a-z]*(?:\/p\d+\/?|\/?))|\/(?:canshu|huxing|xiangce|)-?\d+\/?(?:ybj|sjt|xgt|ght|ptt|wzt|)\.html)$/);
    // 匹配小区列表页，小区详情页,户型图页（只根据区域版块过滤）
    // config.addWhitePath(/^\/community\/?(?:[a-z]*(?:\/p\d+\/?|\/?)|\/view\/\d+|photos\/model\/\d+|photos2\/b\/\d+)\/?$/);
    // 经纪人列表,经纪人详情,经纪人个人信息
    // config.addWhitePath(/^(?:\/tycoon\/?(?:[a-z]*(?:\/?p\d+|)|)|\/gongsi-jjr-\d+(\/js)?)\/?$/);
    // config.addWhitePath(/^\/tycoon(?:\/p\d+|)\/?$/);

    _.forEach(core.config.anjuke.pages, (page) => {
        if (typeof page === "function") {
            page(config);
        }
    });

    return config;
};