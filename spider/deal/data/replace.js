
module.exports = (app)=> {
    let tools = app.spider.utils.tools;

    class Strategy {
        /**
         * 正则匹配数据
         * @returns {String}
         */
        doDeal(result, data) {
            let regexp = new RegExp(tools.replaceRegexp(data.regexp), data.scope || "i");

            return result.replace(regexp, data.repStr || "");
        }
    }
    return new Strategy();
};