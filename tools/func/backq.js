/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    return (key, type, queue, router, options) => {
        let search = (index, from = 0, size = 10) => {
            let defer = Promise.defer(),
                total = 0;

            core.q.getQueue(`crawler.${queue}.${key}`, {}).then((result) => {
                core.elastic.search({
                    index: index,
                    type: type,
                    scroll: '50s',
                    from: options.from,
                    size: options.size,
                    // search_type: 'scan',
                    // from: from,
                    // size: size
                }, function getMoreUntilDone(error, response) {
                    if (error) {
                        console.log(error);
                        return defer.reject(error);
                    }

                    response.hits.hits.forEach(function(res) {
                        res = res._source;
                        console.log(`${result.q.queue}`);
                        result.ch.publish("amq.topic", `${result.q.queue}.${router}`, new Buffer(JSON.stringify(res)), {
                            persistent: true
                        });
                    });
                    total += response.hits.hits.length;
                    console.log("scroll to:", total);
                    if (response.hits.total !== total) {
                        core.elastic.scroll({
                            scrollId: response._scroll_id,
                            from: options.from,
                            size: options.size,
                            scroll: '50s'
                        }, getMoreUntilDone);
                    } else {
                        console.log("done");
                        defer.resolve();
                    }
                });
            }, defer.resolve);

            return defer.promise;
        };

        return search(`${key}-crawler-allin`);
    };
};