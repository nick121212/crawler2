/**
 * Created by NICK on 16/7/1.
 */
let _ = require("lodash");

module.exports = exports = (core) => {
    let check = (infos) => {
        console.log("check at ", new Date());
        _.each(infos.pending, (stat) => {
            let smallestKey = "";

            _.forEach(infos.keys, (val, key) => {
                if (!smallestKey) {
                    smallestKey = key;
                }
                if (infos.keys[smallestKey] > val) {
                    smallestKey = key;
                }
            });

            if (smallestKey && core.config[smallestKey] && core.config[smallestKey].index) {
                infos.keys[smallestKey]++;
                core.func.start(core.config[smallestKey].index, {
                    pid: stat.pid
                });
            }
        });
    };

    return (keys) => {
        let infos = {
            starting: [],
            pending: [],
            keys: {}
        };

        _.each(keys, (key) => {
            key && (infos.keys[key] = 0);
        });

        console.log(infos.keys);

        console.log("start at", new Date());
        core.func.list({
            interval: 5000
        }).then((stats) => {
            _.forEach(stats, (stat) => {
                if (stat.downloader.isStart) {
                    // 如果时间大于3分钟，则杀掉进程。
                    if (Date.now() - stat.downloader.lastTime > 3 * 60 * 1000) {
                        core.func.kill(stat.pid, {});
                    } else {
                        infos.starting.push(stat);
                        !infos.keys[stat.downloader.key] && (infos.keys[stat.downloader.key] = 0);
                        infos.keys[stat.downloader.key]++;
                    }
                } else {
                    infos.pending.push(stat);
                }
            });
            infos.pending.length && check(infos);
        });
    };
};