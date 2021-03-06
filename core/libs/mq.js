let config = require("../config");
let connectionStr = `amqp://${config.q.user}:${config.q.password}@${config.q.host}`;
let amqplib = require('amqplib');
let connPromise = amqplib.connect(connectionStr);

let _ = require("lodash");
let channel = null;
let connection = null;

function getQueue(qName, qSetting) {
    let ch = null;

    return connPromise.then(conn => {
        connection = conn;

        return conn.createChannel();
    }).then((c) => {
        channel = ch = c;
        return c.assertQueue(qName, _.extend({
            durable: true,
            exclusive: false,
            autoDelete: false
        }, qSetting));
    }).then(q => {
        return {
            ch: ch,
            q: q
        };
    });
}

function deleteQueue(qName, qSetting, isClsose = true) {
    let ch = null,
        connec;

    return amqplib.connect(connectionStr).then((conn) => {
            connec = conn;
            return conn.createChannel();
        })
        .then((c) => {
            ch = c;
            return ch.deleteQueue(qName, qSetting || {});
        })
        .then(() => {
            if (isClsose)
                return ch.close();
            return true;
        })
        .then(() => {
            if (isClsose)
                connec.close();
            return true;
        });
}

function closeChannel() {
    if (connection) {
        return connection.close();
    }
}

process.on("exit", () => {
    console.log("exit");
});

module.exports = exports = {
    getQueue: getQueue,
    deleteQueue: deleteQueue,
    close: closeChannel,
    cancel: function(tag) {
            return channel.cancel(tag);
        }
        // rpc: rpc
};