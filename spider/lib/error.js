/**
 * Created by NICK on 16/10/10.
 */

let _ = require("lodash");

module.exports = (app, core, sockets) => {
    let errors = {};
    let err502 = 0;

    return {
        success: (queueItem, next) => {
            delete errors[queueItem.urlId];
            next(false);
        },
        error: (err, queueItem, next) => {
            // 推送错误信息
            app.spider.socket.log({
                message: `${queueItem.url}--${err.message}--${err.status}--${err.code}`,
                isError: true,
                date: Date.now()
            });

            // 可能是页面封锁机制,爬取到的页面是错误的
            console.error(err.status, err.code, err.message, errors[queueItem.urlId]);

            // 错误重试机制
            if (!errors[queueItem.urlId]) {
                errors[queueItem.urlId] = 0;
            }
            // 在定义的错误列表中，加速错误
            if (_.indexOf(core.downloadInstance.ignoreStatusCode, err.status) >= 0 || _.indexOf(core.downloadInstance.ignoreStatusCode, err.code) >= 0) {
                errors[queueItem.urlId] += 40;
            } else {
                errors[queueItem.urlId]++;
            }

            if (err.status === 502) {
                err502++;
            }

            if ((err.status === 502 && core.downloadInstance.proxySettings.useProxy) || (err.status === 601 && core.downloadInstance.proxySettings.useProxy) || (err.code === "ECONNABORTED" && core.downloadInstance.proxySettings.useProxy)) {
                // 重启更换ip服务
                if (err502 > 50 || err.status === 601 || errors[queueItem.urlId] > 150) {
                    errors[queueItem.urlId] = 0;
                    err502 = 0;
                    app.spider.socket.log({
                        message: `发送更换IP请求！！`,
                        isError: true,
                        date: Date.now()
                    });
                    _.each(sockets, (socket) => {
                        socket.emit("crawler:chip", { ipInfo: core.downloadInstance.proxySettings.ipInfo });
                    });
                }

                return next(true, 1000 * 60 * (~~core.downloadInstance.proxySettings.errorInterval || 0.1));
            }

            // 如果错误数超过200，丢弃掉消息
            if (errors[queueItem.urlId] >= 200) {
                delete errors[queueItem.urlId];
                return core.downloadInstance.queueStore.addCompleteQueueItem(queueItem, "", core.downloadInstance.key, "error").then(next, next);
            }

            next(true);
        }
    }
};