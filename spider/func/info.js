/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (app,core) => {

    let call = (cb)=> {
        if (core.downloadInstance) {
            return core.downloadInstance.queue.queueStore.getCount(core.downloadInstance.key).then((counts) => {
                counts.length == 3 && (counts[2] = {
                    consumerCount: counts[2].q.consumerCount,
                    messageCount: counts[2].q.messageCount
                });
                cb(null, counts);
            }, (err) => {
                cb(err);
            });
        } else {
            cb();
        }
    };

    core.q.rpc.on('info', function (params, cb) {
        call(cb);
    }, null, {
        autoDelete: true
    });

    return (key)=> {
        core.q.rpc.on(`info.${key}`, function (params, cb) {
            call(cb);
        }, null, {
            autoDelete: true
        });
    }
};