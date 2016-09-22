const config = require("./config");

module.exports = {
    q: require('./libs/mq'),
    elastic: require('./libs/elastic'),
    db: require("./libs/db"),
    config: config
};