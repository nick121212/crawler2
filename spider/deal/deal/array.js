let _ = require("lodash");

module.exports = (app)=> {
    class Strategy extends app.spider.deal.deal.abase {
        /**
         * 构造函数
         * 注册默认的解析策略
         */
        constructor() {
            super();
        }

        /**
         * 数组的情况下执行
         * @param queueItem {Object}  链接信息
         * @param data      {Object}  配置数据
         * @param results   {Object}  结果数据
         * @param $         {Object}  父jquery对象
         * @param index     {Number}  jquery索引
         * @returns Promise
         */
        doDeal(queueItem, data, results, $, index) {
            let defer = Promise.defer();

            data.key && (results[data.key] = []);
            app.spider.deal.html.index.getOne(data.htmlStrategy).doDeal(queueItem, data, $, index).then((res) => {
                let promises = [];

                res.result = results[data.key];
                for (let i = 0; i < res.len; i++) {
                    results[data.key].push({});
                    promises = promises.concat(this.doDealData(queueItem, data.data.concat([]), res.result, res.$cur, i));
                }
                if (promises.length) {
                    return Promise.all(promises).then((cases) => {
                        let rtnResults = [];
                        _.each(cases, (casee) => {
                            if (casee) {
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