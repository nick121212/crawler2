let _ = require("lodash");

module.exports = (app) => {
    class Strategy extends app.spider.deal.deal.abase {
        /**
         * 构造函数
         * 注册默认的解析策略
         */
        constructor() {
            super();
        }

        /**
         * 数组类型,直接返回空数组
         * @returns Promise
         */
        doDeal(queueItem, data, results, $, index) {
            let defer = Promise.defer();

            app.spider.deal.html.index.getOne(data.htmlStrategy).doDeal(queueItem, data, $, index).then((res) => {
                let promises = [];
                for (let i = 0; i < res.len; i++) {
                    promises = promises.concat(this.doDealData(queueItem, data.data.concat([]), results, res.$cur, i));
                }
                if (promises.length) {
                    return Promise.all(promises).then((cases) => {
                        let rtnResults = [];
                        _.each(cases, (casee) => {
                            if (casee) {
                                _.each(casee.data.data, (d) => {
                                    d.dataIndex = res.index;
                                });
                                rtnResults.push(casee);
                            }
                        });
                        defer.resolve(rtnResults);
                    }).catch(defer.reject);
                }
                defer.resolve(res);
            }, defer.reject);

            return defer.promise;
        }
    }

    return new Strategy();
};