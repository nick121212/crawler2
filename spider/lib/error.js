/**
 * Created by NICK on 16/10/10.
 */

let _ = require("lodash");

module.exports = (app) => {
    let errors = {};

    return {
        success: (queueItem, next, msg)=> {
            delete errors[queueItem.urlId];
            next(msg);
        },
        error: (err, queueItem, next, msg)=> {
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

            if ((err.status === 502 && core.downloadInstance.proxySettings.useProxy) || (err.status === 601 && core.downloadInstance.proxySettings.useProxy) || (err.code === "ECONNABORTED" && core.downloadInstance.proxySettings.useProxy)) {
                // 重启更换ip服务
                if (err.status === 601 || errors[queueItem.urlId] > 150) {
                    errors[queueItem.urlId] = 0;
                    app.spider.socket.log({
                        message: `发送更换IP请求！！`,
                        isError: true,
                        date: Date.now()
                    });
                    socket.emit("crawler:chip");
                }

                return next(msg, true, 1000 * 60 * (~~core.downloadInstance.proxySettings.errorInterval || 0.1));
            }

            // 如果错误数超过200，丢弃掉消息
            if (errors[queueItem.urlId] >= 200) {
                delete errors[queueItem.urlId];
                return core.downloadInstance.queueStore.addCompleteQueueItem(queueItem, "", core.downloadInstance.key, "error").then(next.bind(core.downloadInstance, msg), next.bind(core.downloadInstance, msg));
            }
        }
    }
};