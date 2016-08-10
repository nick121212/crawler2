/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");

module.exports = exports = (app,core) => {
    let kill = (params, cb) => {
        if (params.type) {

            if (params.pid === "all") {
                params.pid = process.pid;
            }

            if (params.type === "forever") {
                return shell.exec(`forever stop ${params.pid}`, function(code, stdout, stderr) {
                    cb(null, {
                        pid: process.pid
                    });
                });
            }
            cb();
        } else {
            cb(null, {
                pid: process.pid
            });
            process.exit(1);
        }
    };

    core.q.rpc.onBroadcast('kill', kill, null, {
        autoDelete: true
    });
    core.q.rpc.on(`kill.${process.pid}`, kill, null, {
        autoDelete: true
    });
};