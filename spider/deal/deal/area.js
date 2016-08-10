let _ = require("lodash");

module.exports = (app)=> {

    class Strategy {
        /**
         * 数组类型,直接返回空数组
         * @param queueItem {Object}
         * @param areas {Object}
         * @returns Promise
         */
        doDeal(queueItem, areas) {
            let promises = [];
            let defer = Promise.defer();

            // 遍历
            _.forEach(areas, (area, key) => {
                let strategy = app.spider.deal.html.index.getOne(area.htmlStrategy);
                area.key = key;
                strategy && promises.push(strategy.doDeal(queueItem, area));
            });
            // 执行
            Promise.all(promises).then((results) => {
                defer.resolve(_.keyBy(results, (res) => {
                    if (res && res.data) {
                        return res.data.key;
                    }
                    return Date.now();
                }));
            }).catch(defer.reject);

            return defer.promise;
        }
    }
    return new Strategy();
};