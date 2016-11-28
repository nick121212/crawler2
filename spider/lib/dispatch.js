/**
 * Created by NICK on 16/10/10.
 */

let _ = require("lodash");
let schedule = require('node-schedule');
let StateMachine = require('javascript-state-machine');

module.exports = (app, core) => {
    let checkQueueSchdule = null;
    const cancelCheckQueue = () => {
        checkQueueSchdule && checkQueueSchdule.cancel();
    };
    const checkQueue = (queue, config) => {
        cancelCheckQueue();
        // 1分钟检测一下queue
        checkQueueSchdule = schedule.scheduleJob('10 * * * * *', function() {
            core.q.getQueue(queue).then((result) => {
                app.spider.socket.log({
                    message: `${queue}还剩下${result.q.messageCount}条数据！共有${result.q.consumerCount}个消费者！${fsm.current}`,
                    isError: false
                });

                app.spider.socket.update({
                    downloader: core.downloadInstance
                });

                if (result.q.messageCount > 0) {
                    fsm.starting(config);
                } else {
                    fsm.stopping(config);
                }
            });
        });
    }
    const startSchedule = (config) => {
        const now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${config.key}`;
        const configNew = _.extend({ aliasKey: config.key }, config, { key: key });
        const promises = [];

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
            fsm.can("started") && fsm.started(config);

        }).catch((err) => {
            app.spider.socket.log({
                message: err.message,
                isError: true
            });
        });
    };
    let scheduleObj;
    const fsm = StateMachine.create({
        initial: 'red',
        events: [
            { name: 'starting', from: 'red', to: 'yellow' },
            { name: 'started', from: 'yellow', to: 'green' },
            { name: 'looping', from: 'green', to: 'green' },
            { name: 'looping', from: 'red', to: 'green' },
            { name: 'stopping', from: 'green', to: 'yellow' },
            { name: 'stopping', from: 'green', to: 'red' },
            { name: 'stopped', from: 'yellow', to: 'red' },
            { name: 'stopped', from: 'red', to: 'red' }

        ],
        callbacks: {
            error: function(eventName, from, to, args, errorCode, errorMessage, originalException) {
                return 'event ' + eventName + ' was naughty :- ' + errorMessage;
            },
            onstarting: (event, from, to, config) => {
                startSchedule(config);
            },
            onstarted: (event, from, to, config) => {
                app.spider.socket.update({
                    downloader: core.downloadInstance
                });
                fsm.looping(`crawler.urls.${core.downloadInstance.key}`, config);
            },
            onlooping: (event, from, to, msg, config) => {
                checkQueue(msg, config);
            },
            onstopping: (event, from, to, config) => {
                cancelCheckQueue();
                if (scheduleObj) scheduleObj.cancel();
                core.downloadInstance.doStop().then(() => {
                    fsm.stopped(config);
                }).catch(() => {
                    fsm.stopping(config);
                });
            },
            onstopped: (event, from, to, config) => {
                scheduleObj = schedule.scheduleJob({ hour: 10, minute: 30 }, function() {
                    app.spider.socket.log({
                        message: `${new Date()}定时任务启动`
                    });
                    startSchedule(config);
                });
                if (core.downloadInstance) {
                    fsm.looping(`crawler.urls.${core.downloadInstance.key}`, config);
                }
            }
        }
    });


    return {
        fsm: fsm,
        checkQueue: checkQueue,
        cancelCheckQueue: cancelCheckQueue,
        scheduleJob: (config) => {
            fsm.stopped(config);
            fsm.can("starting") && fsm.starting(config);
        }
    };
};