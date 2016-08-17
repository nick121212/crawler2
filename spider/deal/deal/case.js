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
         * 普通的情况下执行
         * @returns Promise
         */
        doDeal(queueItem, data, results, $, index) {
            let promise = app.spider.deal.html.index.getOne(data.htmlStrategy).doDeal(queueItem, data, $, index).then((res) => {
                if (!res.result || res.result.indexOf(res.data.match) < 0) {
                    res = null;
                } else {
                    res.result = results;
                    res.$cur = res.$parent;
                }

                return res;
            });

            return promise;
        }
    }

    return new Strategy();
};