/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    let reset = (key) => {
        return Promise.all([
            core.elastic.indices.exists({
                index: `${key}-crawler-allin`
            }).then((exists) => {
                if (exists) {
                    return core.elastic.indices.delete({
                        index: `${key}-crawler-allin` || "_all"
                    });
                }
                return null;
            }),
            core.q.deleteQueue(`crawler.deals.${key}`),
            core.q.deleteQueue(`crawler.urls.${key}`),
        ]);
    };

    _.each(sockets, (socket) => {
        socket.on("crawler:reset", (params, cb) => {
            reset(params.key.key).then(() => {
                cb({
                    ret: 0
                });
            }, (e) => {
                cb({
                    ret: -1,
                    msg: e.message
                });
            });
        });
    });

    return reset;
};