let config = require("../config");
let connectionStr = `amqp://${config.q.user}:${config.q.password}@${config.q.host}`;
let amqplib = require('amqplib')

let rpc = require('amqp-rpc').factory({
    url: connectionStr
});
let _ = require("lodash");

let channel = null;

function getQueue(qName, qSetting) {
    let defer = Promise.defer(), ch = null;

    amqplib.connect(connectionStr).then(conn => {
        return conn.createChannel();
    }).then((c) => {
        ch = c;
        return c.assertQueue(qName, _.extend({
            durable: true,
            exclusive: false,
            autoDelete: false
        }, qSetting));
    }).then(q => {
        defer.resolve({
            ch: ch,
            q: q
        });
    }).catch(defer.reject);

    return defer.promise;
}

function deleteQueue(qName, qSetting) {
    let defer = Promise.defer(), ch = null;

    amqplib.connect(connectionStr).then((conn) => {
        return conn.createChannel();
    })
        .then((c) => {
            ch = c;
            return ch.deleteQueue(qName, qSetting || {});
        })
        .then(()=> {
            return ch.close();
        })
        .then(defer.resolve)
        .catch(defer.reject);

    return defer.promise;
}

process.on("exit", ()=> {
    console.log("exit");
});

module.exports = exports = {
    getQueue: getQueue,
    deleteQueue: deleteQueue,
    rpc: rpc
};