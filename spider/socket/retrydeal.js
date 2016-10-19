/**
 * Created by NICK on 16/7/1.
 */

let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    _.each(sockets, (socket)=> {
        socket.on("crawler:retrydeal", (params, cb)=> {
            let config = params.key;
            let index = `${config.key}-crawler-allin`;
            let type = 'rsbody';
            let total = 0;
            let queueEs = new app.spider.lib.queue_store_es(config.key);

            let getMoreUntilDone = (err, response)=> {

                let promises = [];

                if (err) {
                    return cb({
                        ret: -1,
                        message: err.message
                    });
                }
                response.hits.hits.forEach(function (res) {
                    res = res._source;
                    promises.push(queueEs.addCompleteQueueItemsToQueue({
                        url: res.url,
                        urlId: res.urlId
                    }, res.text, config.key));
                });
                total += response.hits.hits.length;
                app.spider.socket.log({
                    message: `当前scroll：{${response._scroll_id}},数量：${total},总数量：${response.hits.total}`,
                    isError: false
                });
                if (response.hits.total !== total) {
                    Promise.all(promises).then(()=> {
                        core.elastic.scroll({
                            scrollId: response._scroll_id,
                            scroll: '30s'
                        }, getMoreUntilDone);
                    }, (err)=> {
                        return cb({
                            ret: -1,
                            message: err.message
                        });
                    });
                } else {
                    cb({
                        ret: 0
                    });
                }
            };

            core.elastic.search({
                index: index,
                type: type,
                scroll: '10s',
                search_type: 'scan',
                _source: ["urlId", "url"],
                from: 0,
                size: 100
            }, getMoreUntilDone);
        });
    });
};