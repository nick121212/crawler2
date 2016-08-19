module.exports = (app) => {

    class DealStrategy {
        getOne(key) {
            let htmls = app.spider.deal.html;

            return htmls[key] || htmls['jsdom'];
        }
    }
    return new DealStrategy();
};