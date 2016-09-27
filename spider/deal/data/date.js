let qs = require("qs");
let moment = require("moment");

module.exports = (app)=> {
    /**
     * 处理html文本策越
     */
    class Strategy {
        /**
         * 转换成日期类型
         * @param reseult {Any}
         * @returns {String}
         */
        doDeal(result) {
            return moment(result, 'YYYY-MM-DD');
        }
    }
    return new Strategy();
};
// module.exports = exports = new Strategy();