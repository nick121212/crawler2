/**
 * Created by NICK on 16/7/1.
 */
let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    let start = (params, cb) => {
        let config = params.key;
        let options = params.options;

        if (core.downloadInstance && core.downloadInstance.isStart) {
            return cb({
                ret: -1,
                pid: process.pid,
                msg: `${process.pid}已经启动了！`
            });
        }

        if (!config.key) {
            return cb({
                ret: -1,
                pid: process.pid,
                msg: `Key没有定义！`
            });
        }

        try {
            config.blackPathList = config.blackPathList || [];
            config.blackPathList = config.blackPathList.map((path) => {
                return new RegExp(app.spider.utils.tools.replaceRegexp(path.regexp), path.scope);
            });
            // 查找enable是true的白名单
            config.whitePathList = _.filter(config.whitePathList, (list) => {
                return list.enable === true;
            });
            config.whitePathList = config.whitePathList.map((path) => {
                return new RegExp(app.spider.utils.tools.replaceRegexp(path.regexp), path.scope);
            });
            // 启动爬虫
            core.downloadInstance = new app.spider.index(config);
            options.startCrawler && core.downloadInstance.doStart();
            options.startDeal && core.downloadInstance.doInitHtmlDeal();
            app.spider.socket.update({
                downloader: core.downloadInstance
            });
            cb({
                ret: 0,
                pid: process.pid
            });
        } catch (e) {
            cb({
                ret: -1,
                pid: process.pid,
                msg: e.message
            });
        }
    };

    _.each(sockets, (socket) => {
        // 启动爬虫实例
        socket.on("crawler:start", (params, cb) => {
            start(params, cb);
        });
    });

};