/**
 * Created by NICK on 16/10/10.
 */

let _ = require("lodash");
let schedule = require('node-schedule');
let StateMachine = require('javascript-state-machine');

module.exports = (app, core) => {
    let scheduleObj;
    let timeId;
    let timeInterval = 60000;

    const checkQueue = (queue, config) => {
        console.log("开始checkqueue定时任务");
        if (timeId) {
            clearTimeout(timeId);
        }
        timeId = setTimeout(() => {
            core.q.getQueue(queue).then((result) => {
                app.spider.socket.log({
                    message: `${queue}还剩下${result.q.messageCount}条数据！共有${result.q.consumerCount}个消费者！${fsm.current}`,
                    isError: false
                });

                app.spider.socket.update({
                    downloader: core.downloadInstance
                });

                if (result.q.messageCount > 0) {
                    if (fsm.is("red")) {
                        fsm.starting(config);
                    } else {
                        fsm.looping(queue, config);
                    }
                } else {
                    fsm.can("stopping") && fsm.stopping(config);
                }
            });
        }, timeInterval);
    }
    const startSchedule = (config) => {
        const now = new Date();
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${config.key}`;
        const configNew = _.extend({ aliasKey: config.key }, config, { key: key });
        const promises = [];

        console.log("开始爬取数据！");
        if (core.downloadInstance) {
            promises.push(core.downloadInstance.doStop());
        }
        promises.push(app.spider.socket.reset(`${now.getFullYear()}-${now.getMonth()}-${now.getDate() - 3}-${config.key}`));
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
    const fsm = StateMachine.create({
        initial: 'red',
        events: [
            { name: 'starting', from: 'red', to: 'yellow' },
            { name: 'started', from: 'yellow', to: 'green' },
            { name: 'looping', from: 'green', to: 'green' },
            { name: 'looping', from: 'red', to: 'red' },
            { name: 'stopping', from: 'green', to: 'red' },
            { name: 'stopped', from: 'yellow', to: 'red' }
        ],
        callbacks: {
            error: function(eventName, from, to, args, errorCode, errorMessage, originalException) {
                return 'event ' + eventName + ' was naughty :- ' + errorMessage;
            },
            onstarting: (event, from, to, config) => {
                if (scheduleObj) scheduleObj.cancel();
                scheduleObj = schedule.scheduleJob({ hour: 10, minute: 30 }, function() {
                    startSchedule(config);
                });
                startSchedule(config);
            },
            onstarted: (event, from, to, config) => {
                fsm.looping(`crawler.urls.${core.downloadInstance.key}`, config);
            },
            onlooping: (event, from, to, msg, config) => {
                checkQueue(msg, config);
            },
            onstopping: (event, from, to, config) => {
                core.downloadInstance.doStop().then(() => {
                    fsm.stopped(config);
                }).catch(() => {
                    fsm.stopping(config);
                });
            },
            onstopped: (event, from, to, config) => {
                if (core.downloadInstance) {
                    fsm.looping(`crawler.urls.${core.downloadInstance.key}`, config);
                }
            }
        }
    });

    return {
        fsm: fsm,
        scheduleJob: (config) => {
            if (fsm.current == "red") {
                if (!fsm.is("looping")) {
                    fsm.can("starting") && fsm.starting(config);
                }
            }
        }
    };
};