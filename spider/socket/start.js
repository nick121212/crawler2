/**
 * Created by NICK on 16/7/1.
 */
let _ = require("lodash");

module.exports = exports = (app, core, socket) => {
    // let ipInfo = app.spider.utils.ipinfo;
    let start = (config, cb) => {
        // let config = typeof params.config === "object" ? params.config : JSON.parse(params.config);

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
            config.blackPathList = config.blackPathList.map((path) => {
                return new RegExp(app.spider.utils.tools.replaceRegexp(path.regexp), path.scope);
            });
            config.whitePathList = config.whitePathList.map((path) => {
                return new RegExp(app.spider.utils.tools.replaceRegexp(path.regexp), path.scope);
            });
            try {
                // 启动爬虫
                core.downloadInstance = new app.spider.index(config);
                core.downloadInstance.doStart();

                if (core.downloadInstance.isStart) {
                    cb({
                        ret: 0,
                        pid: process.pid
                    });
                } else {
                    cb({
                        ret: -1,
                        pid: process.pid,
                        msg: "启动失败！"
                    });
                }
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

    socket.on("crawler:start", (params, cb)=> {
        start(params, cb);
    });
};