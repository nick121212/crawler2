/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (app, core) => {
    core.q.rpc.on('del', function (params, cb) {
        Promise.all([
            core.elastic.indices.exists({
                index: `${params.key}-crawler-allin`
            }).then((exists) => {
                if (exists) {
                    return core.elastic.indices.delete({
                        index: `${params.key}-crawler-allin` || "_all"
                    });
                }
                return null;
            }),
            core.q.deleteQueue(`crawler.deals.${params.key}`),
            core.q.deleteQueue(`crawler.urls.${params.key}`),
        ]).then(() => {
            cb(null, "删除成功");
        }, cb);
    }, null, {
        autoDelete: true
    });
};