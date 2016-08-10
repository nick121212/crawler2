/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    return (hostname, options) => {
        let defer = Promise.defer();

        core.q.rpc.call(`create.${hostname}`, {
            type: options.type
        }, (err, stat) => {
            if (err) {
                console.log(err);
            } else {
                console.log(stat);
            }
            defer.resolve();
        });

        return defer.promise;
    };
};