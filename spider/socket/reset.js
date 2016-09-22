/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (app, core, socket) => {
    socket.on("crawler:reset", (params, cb)=> {
        let config = params.key;

        Promise.all([
            core.elastic.indices.exists({
                index: `${config.key}-crawler-allin`
            }).then((exists) => {
                if (exists) {
                    return core.elastic.indices.delete({
                        index: `${config.key}-crawler-allin` || "_all"
                    });
                }
                return null;
            }),
            core.q.deleteQueue(`crawler.deals.${config.key}`),
            core.q.deleteQueue(`crawler.urls.${config.key}`),
        ]).then(() => {
            cb({
                ret: 0
            });
        }, (e)=> {
            cb({
                ret: -1,
                msg: e.message
            });
        });
    });
};