const ip = process.env.NODE_IP || "192.168.222.90";

module.exports = exports = {
    elastic: {
        host: ip,
        port: 9200
    },
    q: {
        host: ip,
        user: "nick",
        password: "111111"
    },
    hosts: process.env.NODE_IPS ? process.env.NODE_IPS.split(',') : []
};