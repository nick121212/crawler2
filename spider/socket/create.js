/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");

module.exports = exports = (app, core, socket) => {
    socket.on("crawler:create", (params, cb)=> {
        let type = params.type;
        let cwd = process.cwd();
        let command = "";

        try {
            switch (type) {
                case "forever":
                    command = `ENV=${process.env.ENV} forever start --workingDir ${cwd} .`;
                    break;
                default:
                    command = `ENV=${process.env.ENV} node ${cwd}/index.js &`;
                    break;
            }
            shell.exec(command, function (code) {
                cb({
                    ret: 0,
                    pid: process.pid
                });
            });
        } catch (e) {
            cb({
                ret: -1,
                pid: process.pid,
                msg: e.message
            });
        }
    });
};