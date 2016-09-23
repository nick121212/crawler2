/**
 * Created by NICK on 16/7/1.
 */
let _ = require("lodash");

module.exports = exports = (app, core, socket) => {
    // let ipInfo = app.spider.utils.ipinfo;
    let start = (params, cb) => {
        // let config = typeof params.config === "object" ? params.config : JSON.parse(params.config);
        let config = params.key;
        let options = params.options;

        if (core.downloadInstance) {
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

            config.whitePathList = config.whitePathList.map((path) => {
                return new RegExp(app.spider.utils.tools.replaceRegexp(path.regexp), path.scope);
            });

            try {
                // 启动爬虫
                core.downloadInstance = new app.spider.index(config);

                options.startCrawler && core.downloadInstance.doStart();
                options.startDeal && core.downloadInstance.doInitHtmlDeal();
                options.startDownload && core.downloadInstance.doInitDownloadDeal();
                // options.startChip && app.spider.socket.changeip();

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
        } catch (e) {
            cb({
                ret: -1,
                pid: process.pid,
                msg: e.message
            });
        }
    };

    // 启动爬虫实例
    socket.on("crawler:start", (params, cb)=> {
        start(params, cb);
    });

    // 启动爬虫分析html部分代码
    socket.on("crawler:start:html", (params, cb)=> {
        if (!core.downloadInstance) {
            return cb({
                ret: -1,
                pid: process.pid,
                msg: `还未初始化爬虫！`
            });
        }

        if (!core.downloadInstance.isStartDeal) {
            core.downloadInstance.doInitHtmlDeal();
        }

        return cb({ret: 0});
    });

    // 启动下载图片代码
    socket.on("crawler:start:picture", (params, cb)=> {
        if (!core.downloadInstance) {
            return cb({
                ret: -1,
                pid: process.pid,
                msg: `还未初始化爬虫！`
            });
        }

        if (!core.downloadInstance.isStartDownload) {
            core.downloadInstance.doInitDownloadDeal();
        }

        return cb({ret: 0});
    });

};