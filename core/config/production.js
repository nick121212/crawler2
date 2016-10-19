let ip = process.env.NODE_QUEUE || "114.55.146.215";

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
    hosts: process.env.NODE_IPS.split(',')
};