/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");

module.exports = exports = (app,core) => {
    let ipInfo = app.spider.utils.ipinfo;

    core.q.rpc.on(`create.${ipInfo.hostname}`, function(params, cb) {
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
            shell.exec(command, function(code) {
                cb(null, code);
            });
        } catch (e) {
            cb(e);
        }
    }, null, {
        autoDelete: true
    });

};