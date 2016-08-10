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
        doDeal(result) {
            let res = Number(result);

            if (Number.isNaN(res)) {
                res = 0;
            }

            return res;
        }
    }
    return new Strategy();
};
