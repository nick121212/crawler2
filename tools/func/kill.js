/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    let onResponse = (err, stat) => {
        if (err) {
            console.error(err);
        } else {
            console.log(`killed:${stat.pid}`);
        }
    };
    return (pid, options) => {
        let defer = Promise.defer();
        let params = {
            pid: pid,
            type: options.type
        };

        if (pid && pid !== "all") {
            core.q.rpc.call(`kill.${pid}`, params, (err, stat) => {
                onResponse(err, stat);
                defer.resolve();
            });
        } else {
            console.log("d");
            core.q.rpc.callBroadcast('kill', params, {
                ttl: 1000,
                onResponse: onResponse,
                onComplete: function() {
                    defer.resolve();
                }
            });
        }

        return defer.promise;
    };
};