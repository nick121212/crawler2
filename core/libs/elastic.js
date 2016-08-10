let elasticsearch = require('elasticsearch');
let config = require('../config');
let client = new elasticsearch.Client({
    host: `${config.elastic.host}:${config.elastic.port}`,
    log: [{
        type: 'stdio',
        levels: ['error', 'warning']
    }]
});

module.exports = exports = client;