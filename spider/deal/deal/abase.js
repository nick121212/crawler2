let _ = require("lodash");

module.exports = (app)=> {

    class Base {
        constructor() {
            this.deals = {};
        }

        /**
         * 处理data数据
         * @param queueItem  {Object}
         * @param data       {Object}
         * @param curResults {Object}
         * @param $          {Object}
         * @param index      {Number}
         * @return {Array<Promise>}
         */
        doDealData(queueItem, data, curResults, $, index) {
            let promises = [];
            let strategy = null;

            _.each(data, (d) => {
                strategy = this.deals[d.dealStrategy] || this.deals.normal;
                promises.push(strategy.doDeal.call(this, queueItem, d, curResults, $, index));
            }, this);

            return promises;
        }

        /**
         * 数据的格式化函数
         * @param result  {String}
         * @param formats {Array<Object>}
         * @return {String|Number}
         */
        doFormatData(result, formats) {
            let res = result;

            _.each(formats, (format) => {
                _.forEach(format, (params, key) => {
                    res = app.spider.deal.data.index.doDeal(key, res, params);
                });
            });

            return res;
        }
    }

    return Base;
};