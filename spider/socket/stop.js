/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");

module.exports = exports = (app, core, socket) => {
    let kill = (params, cb) => {
        let options = params.options;

        if (options.type) {
            if (options.type === "forever") {
                return shell.exec(`forever stop ${process.pid}`, function (code, stdout, stderr) {
                    cb({
                        ret: 0,
                        pid: process.pid
                    });
                });
            }
            cb();
        } else {
            cb({
                ret: 0,
                pid: process.pid
            });
            process.exit(1);
        }
    };

    socket.on('crawler:stop', (params, cb)=> {
        kill(params, cb);
    });

};