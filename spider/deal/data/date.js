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
        doDeal(result, settings) {
            let res = moment(result, settings.format || 'YYYY-MM-DD');

            if (res.isValid()) {
                return res.format(settings.format || "YYYY-MM-DD");
            }

            return "1990-01-01";
        }
    }
    return new Strategy();
};