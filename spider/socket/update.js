/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");
let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    return (info)=> {
        info.updateAt = Date.now();

        _.each(sockets, (socket)=> {
            socket.emit("crawler:update", info);
        });
    }
};