let _ = require("lodash");

/**
 * 处理html文本策越
 */

module.exports = (app) => {
    class TypeStrategy extends app.spider.deal.deal.abase {
        /**
         * 构造函数
         * 注册默认的解析策略
         */
        constructor() {
            super();
            this.deals = app.spider.deal.deal;
        }

        /**
         * 开始处理文本
         * @param queueItem      {Object}    数据
         * @param rule        {Object} 配置
         * @returns {Promise}
         */
        doDeal(queueItem, rule) {
            let defer = Promise.defer();
            let promiseAll = [];
            let dataResults = {};
            let check = (results) => {
                let promises = [];
                let getPromises = (results) => {
                    _.forEach(results, (result) => {
                        if (_.isArray(result)) {
                            getPromises(result);
                        } else {
                            result && result.data && result.data.data && (promises = promises.concat(this.doDealData.call(this, queueItem, result.data.data, result.result, result.$cur, result.index)));
                        }
                    });
                };
                getPromises(results);

                return promises.length ? Promise.all(promises).then(check, defer.reject) : defer.resolve({
                    result: dataResults,
                    rule: rule
                });
            };

            // 处理area
            this.deals.area.doDeal(queueItem, rule.areas).then((results) => {
                _.forEach(rule.fields, (field, key) => {
                    promiseAll = promiseAll.concat(this.doDealData.call(this, queueItem, field.data, dataResults, results[key] ? results[key].$cur : null));
                });

                return Promise.all(promiseAll).then(check, (err)=> {
                    defer.reject(err);
                });
            }, defer.reject);

            return defer.promise;
        }
    }

    return new TypeStrategy();
};