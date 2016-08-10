/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    let all_stats = {};
    let onResponse = (err, stat) => {
        if (err) {
            console.log(err);
        } else {
            stat && (all_stats[stat.hostname + ':' + stat.pid] = stat);
        }
    }
    let onComplete = (defer) => {
        let i = 1;
        console.log('----------------------- STATISTICS ----------------------------------------');
        console.log('index\thostname\tip\tpid\tuptime\tcounter\thost\tlastFetchDate');
        for (let worker in all_stats) {
            let s = all_stats[worker];
            console.log(`${i++}\t${s.hostname}\t${s.ip}\t${s.pid}\t${s.uptime.toFixed(2)}s\t${s.counter}\t${s.downloader.host || ''}\t${  (Date.now() - s.downloader.lastTime ) || ''}`);
        }
        defer.resolve(all_stats);
    };
    let name = 'getWorkerStat',
        params = {
            type: 'fullStat'
        };

    return (options) => {
        let defer = Promise.defer();

        if (options.pid) {
            core.q.rpc.call(`${name}.${options.pid}`, params, (err, stat) => {
                onResponse(err, stat);
                onComplete(defer);
            });
        } else {
            core.q.rpc.callBroadcast(options.hostname ? `${name}.${options.hostname}` : name, params, {
                ttl: options.interval || 1000,
                onResponse: onResponse,
                onComplete: onComplete.bind(this, defer)
            });
        }

        return defer.promise;
    };
};