/**
 * Created by NICK on 16/10/10.
 */

let _ = require("lodash");
let schedule = require('node-schedule');

module.exports = (app, core) => {
    let checkQueueSchdule = null;
    const cancelCheckQueue = () => {
        checkQueueSchdule && checkQueueSchdule.cancel();
    };
    const checkQueue = (queue) => {
        cancelCheckQueue();
        // 1分钟检测一下queue
        checkQueueSchdule = schedule.scheduleJob('30 * * * * *', function () {
            core.q.getQueue(queue).then((result) => {
                app.spider.socket.log({
                    message: `${queue}还剩下${result.q.messageCount}条数据！共有${result.q.consumerCount}个消费者！`,
                    isError: false
                });
                if (result.q.messageCount > 0) {
                    if (!core.downloadInstance.isStart) {
                        core.downloadInstance.doStop().then(()=> {
                            core.downloadInstance.doStart();
                            core.downloadInstance.doInitHtmlDeal();

                            app.spider.socket.update({
                                downloader: core.downloadInstance
                            });
                        });
                    }
                } else {
                    core.downloadInstance.doStop().chain(()=> {
                        app.spider.socket.update({
                            downloader: core.downloadInstance
                        });
                    });
                }
            });
        });
    }

    let startSchedule = (config) => {
        let now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${config.key}`;
        let configNew = _.extend({aliasKey: config.key}, config, {key: key});
        let promises = [];

        console.log("开始定时任务！！！！！！！！");

        if (core.downloadInstance) {
            promises.push(core.downloadInstance.doStop());
        }

        promises.push(app.spider.socket.reset(`${now.getFullYear()}-${now.getMonth()}-${now.getDate() - 3}-${config.key}`));

        // promises.push(app.spider.socket.reset(configNew));
        Promise.all(promises).then(() => {
            core.downloadInstance = new app.spider.index(configNew);
            core.downloadInstance.doStart();
            core.downloadInstance.doInitHtmlDeal();
            app.spider.socket.update({
                downloader: core.downloadInstance
            });
        }).catch((err) => {
            app.spider.socket.log({
                message: err.message,
                isError: true
            });
        });
    };

    return {
        checkQueue: checkQueue,
        cancelCheckQueue: cancelCheckQueue,
        scheduleJob: (config) => {
            schedule.scheduleJob({hour: 10, minute: 30}, function () {
                app.spider.socket.log({
                    message: `${new Date()}定时任务启动`
                });
                // core.downloadInstance = new app.spider.index(config);
                startSchedule(config);
            });

            startSchedule(config);
        }
    };
};