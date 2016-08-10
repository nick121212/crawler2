let qs = require("qs");

module.exports = (app)=> {
    /**
     * 处理html文本策越
     */
    class Strategy {
        /**
         * 转换成数字类型
         * @param reseult {Any}
         * @returns {String}
         */
        doDeal(result, settings) {
            let res = result;

            try {
                if (settings.parse) {
                    res = JSON.parse(res);
                }
                if (settings.func && settings.func.constructor === Function) {
                    res = settings.func.call(this, res);
                }
            } catch (e) {
            }

            return res;
        }
    }
    return new Strategy();
};
// module.exports = exports = new Strategy();