/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    return (key, options) => {
        let defer = Promise.defer();

        core.q.rpc.call(`del`, {
            key: key
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