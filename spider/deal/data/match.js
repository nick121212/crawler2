let qs = require("qs");

module.exports = (app)=> {
    let tools = app.spider.utils.tools;

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
            let regex = new RegExp(tools.replaceRegexp(settings.regexp), settings.scope || "ig");
            let matchs = result.match(regex);
            let res = result;

            settings.index = settings.index || 0;

            if (matchs.length > settings.index || 0) {
                res = matchs[settings.index];
            }

            return res;
        }
    }

    return new Strategy();
};
