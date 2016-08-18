let _ = require("lodash");
let jpp = require("json-path-processor");

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
         * 数组的情况下执行
         * @returns Promise
         */
        doDeal(queueItem, data, results, $, index) {
            let promise = app.spider.deal.html.index.getOne(data.htmlStrategy).doDeal(queueItem, data, $, index).then((res) => {
                let jData = jpp(results);
                let path = "";
                let idx = _.isUndefined(res.data.dataIndex) ? res.index : res.data.dataIndex;

                if (typeof idx === "number" && _.isArray(results)) {
                    path = `${idx}`;
                }

                if (path) {
                    results = jData.get(path).value();
                }
                results[data.key] = {};
                res.result = results[data.key];

                if (path) {
                    res.index = null;
                }

                return res;
            });

            return promise;
        }
    }

    return new Strategy();
};