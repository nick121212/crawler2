/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    let all_stats = {};
    let onResponse = (err, stat) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`${stat.pid}启动了！`);
        }
    };
    let name = "start";

    return (config, options) => {
        let defer = Promise.defer();
        let params = {
            config: config,
            pid: options.pid
        };

        if (options.pid) {
            core.q.rpc.call(`${name}.${options.pid}`, params, (err, stat) => {
                onResponse(err, stat);
                defer.resolve();
            });
        } else {
            core.q.rpc.callBroadcast(options.hostname ? `${name}.${options.hostname}` : name, params, {
                ttl: options.interval || 1000,
                onResponse: onResponse,
                onComplete: defer.resolve
            });
        }

        return defer.promise;
    };
};