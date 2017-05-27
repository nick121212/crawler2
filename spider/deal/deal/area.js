let _ = require("lodash");
global.Promise = require("bluebird");

module.exports = (app) => {

    class Strategy {
        /**
         * 数组类型,直接返回空数组
         * @param queueItem {Object}
         * @param areas {Object}
         * @returns Promise
         */
        doDeal(queueItem, areas) {
            let promises = [];

            // 遍历
            _.each(areas, (area, key) => {
                let strategy = app.spider.deal.html.index.getOne(area.htmlStrategy);
                // area.key = key;
                strategy && promises.push(strategy.doDeal(queueItem, area));
            });
            // 执行
            return Promise.all(promises).then((results) => {
                return _.keyBy(results, (res) => {
                    if (res && res.data) {
                        return res.data.key;
                    }
                    return Date.now();
                });
            });
        }
    }
    return new Strategy();
};