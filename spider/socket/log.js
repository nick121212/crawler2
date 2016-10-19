/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");
let _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    return (info)=> {
        info.updateAt = Date.now();
        info.process = process.pid;

        _.each(sockets, (socket)=> {
            "use strict";
            socket.emit("crawler:log", info);
        });
    }
};