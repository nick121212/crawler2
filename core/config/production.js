let ip = process.env.NODE_IP || "114.55.146.215";

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
    socket: {
        host: ip,
        port: 3000
    }
};