let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {

    let loop = () => {

    };

    _.each(sockets, (socket) => {
        // 设置调度
        socket.on("crawler:loop", (params, cb) => {

        });
    });
}