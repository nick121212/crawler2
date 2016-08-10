let config = require("../config");
let connectionStr = `amqp://${config.q.user}:${config.q.password}@${config.q.host}`;
let connPromise = require('amqplib').connect(connectionStr);
let rpc = require('amqp-rpc').factory({
    url: connectionStr
});

function getQueue(qName, qSetting) {
    let defer = Promise.defer(),
        ch = null;

    connPromise.then(conn => {
            return conn.createChannel();
        }).then((c) => {
            ch = c;
            return ch.assertQueue(qName, qSetting);
        })
        .then(q => {
            defer.resolve({
                ch: ch,
                q: q
            });
        }).catch(defer.reject);

    return defer.promise;
}

function deleteQueue(qName, qSetting) {
    let defer = Promise.defer();

    connPromise.then((conn) => {
            return conn.createChannel();
        })
        .then((c) => {
            return c.deleteQueue(qName, qSetting || {});
        })
        .then(defer.resolve)
        .catch(defer.reject);

    return defer.promise;
}

module.exports = exports = {
    getQueue: getQueue,
    deleteQueue: deleteQueue,
    rpc: rpc
};