const elasticsearch = require('elasticsearch');
const config = require('../config');

const client = new elasticsearch.Client({
    host: `${config.elastic.host}:${config.elastic.port}`,
    log: [{
        type: 'stdio',
        levels: ['error', 'warning']
    }]
});

module.exports = exports = client;