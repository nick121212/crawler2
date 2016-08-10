let _ = require("lodash");

module.exports = (app)=> {

    class DealStrategy {
        getOne(key) {
            let htmls = app.spider.deal.html;

            return htmls[key] || htmls['jsdom'];
        }

        /**
         * 获取所有的数据promise
         * @param queueItem
         * @param data
         * @param curResults
         * @param promises
         * @returns {Array}
         */
        getPromises(queueItem, data, curResults, $) {
            let results = curResults || {};
            let promises = [],
                promise;

            _.each(data, (d) => {
                let isArray = _.isArray(results);

                if (isArray) {
                    _.each(results, (value, index) => {
                        promise = (this.deals[d.dealStrategy] || jsdomStrategy).doDeal(queueItem, d, $, index)
                        promise.then((res) => {
                            if (d.key) {
                                res && (results[res.index][d.key] = res.result);
                            } else {
                                res && (results[res.index] = res.result);
                            }
                        });
                        promises.push(promise);
                    });
                } else {
                    results[d.key] = app.spider.deal.data.index.doDeal(null, d);
                    promise = this.getOne(d.dealStrategy).doDeal(queueItem, d, $);
                    promise.then((res) => {
                        res && (results[d.key] = res.result);

                        return res;
                    });
                    promises.push(promise);
                }
            });

            return promises;
        }

        /**
         * 处理区域数据
         * @param queueItem
         * @param areas
         * @return Promise
         */
        doDealAreas(queueItem, areas) {
            let promises = [];
            let defer = Promise.defer();

            _.forEach(areas, (area, key) => {
                area.key = key;
                promises.push(this.getOne(d.dealStrategy).doDeal(queueItem, area));
            }, this);
            Promise.all(promises).then((results) => {
                defer.resolve(_.keyBy(results, function (res) {
                    if (res && res.data) {
                        return res.data.key;
                    }
                    return Date.now();
                }));
            }).catch(defer.reject);

            return defer.promise;
        }

        /**
         * 开始处理文本,一层层往下
         * @param queueItem {Object} 数据
         * @param data      {Object} 规则配置
         * @returns promise
         */
        doDeal(queueItem, rule) {
            let defer = Promise.defer();
            let dataResults = {};
            let promiseAll = [];
            let check = (results) => {
                let promises = [];

                _.forEach(results, (result) => {
                    result && result.data && result.data.data && (promises = promises.concat(this.getPromises(queueItem, result.data.data, result.result, result.$)));
                });

                return promises.length ? Promise.all(promises).then(check, defer.reject) : defer.resolve({
                    result: dataResults,
                    rule: rule
                });
            };
            // 处理区域
            this.doDealAreas(queueItem, rule.area).then((results) => {
                _.forEach(rule.area, (area) => {
                    promiseAll = promiseAll.concat(this.getPromises(queueItem, area.data, dataResults, results[area.key] ? results[area.key].$ : null));
                });

                return Promise.all(promiseAll).then(check);
            }).catch(defer.reject);

            return defer.promise;
        }
    }
    return new DealStrategy();
};