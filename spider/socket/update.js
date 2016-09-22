/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");

module.exports = exports = (app, core, socket) => {
    return (info)=> {
        info.updateAt = Date.now();
        socket.emit("crawler:update", info);
    }
};