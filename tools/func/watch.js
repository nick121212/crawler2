/**
 * Created by NICK on 16/7/1.
 */

/**
 * Created by NICK on 16/7/1.
 */
let schedule = require("node-schedule");
let _ = require("lodash");

module.exports = exports = (core) => {
    let keys;

    return (options) => {
        keys = options.keys.split(',');
        // 启动定时任务,默认10分钟执行一次
        schedule.scheduleJob(`*/${options.interval || 10} * * * *`, () => {
            core.func.watchs.average(keys);
        });
        core.func.watchs.average(keys);
    };
};