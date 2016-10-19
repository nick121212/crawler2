let ip = process.env.NODE_IP || "114.55.146.215";
let port = process.env.NODE_PORT || 3000;

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
        port: port
    },
    socketChip: {
        host: process.env.NODE_CHIP || "114.55.146.215",
        port: process.env.NODE_CHPORT || 3000
    }
};