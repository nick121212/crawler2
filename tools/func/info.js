/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    return (options) => {
        let defer = Promise.defer();

        core.q.rpc.call('info' + `${options.key ? "." + options.key : ""}`, {}, (err, counts) => {
            if (err) {
                console.error(err);
            } else {
                console.log(counts);
            }
            defer.resolve();
        });

        return defer.promise;
    };
};