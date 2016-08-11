/**
 * Created by NICK on 16/8/10.
 */

const fs = require("fs");
const md5 = require("blueimp-md5");
const request = require("superagent");
const requestProxy = require("superagent-proxy")(request);

class Download {
    start(uri, settings = {}, ipInfo = {}) {
        let defer = Promise.defer();

        try {
            let req = request.get(uri.toString());

            if (settings.useProxy && settings.ipInfo && settings.ipInfo.port && settings.ipInfo.port) {
                req.proxy(`http://${settings.ipInfo.host}:${settings.ipInfo.port}`);
            }
            req.pipe(fs.createWriteStream(`${__dirname}/images/${md5(uri.toString())}`))
                .end((err, res) => {
                    if (err) {
                        return defer.reject(err);
                    }
                    defer.resolve();
                });
        } catch (err) {
            defer.reject(err);
        }

        return defer.promise;
    }
}

module.exports = (app, core)=> {
    return new Download();
};