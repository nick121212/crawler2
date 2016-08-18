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
            let promises = this.doDealData(queueItem, data.data.concat([]), results, $, index);

            return Promise.all(promises).then((cases) => {
                let rtnResults = [];

                _.each(cases, (casee) => {
                    if (casee.result) {
                        rtnResults.push(casee);
                        return false;
                    }
                });
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    return new Strategy();
};