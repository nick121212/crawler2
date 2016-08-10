// let str = require("./str.js");
// let qs = require("./query_string.js");
// let num = require("./number.js");
// let regexp = require("./regexp.js");
// let match = require("./match.js");
// let repl = require("./replace.js");
// let json = require("./json.js");

module.exports = (app)=> {
    class TypeStrategy {
        /**
         * 开始处理文本
         * @param result      {Any}    数据
         * @param config      {Object} 配置
         * @returns Any
         */
        doDeal(key, result, params) {
            let formats = app.spider.deal.data;
            let strategy = formats[key];

            try {
                return strategy.doDeal(result, params);
            } catch (e) {
                return result;
            }
        }
    }
    return new TypeStrategy();
};