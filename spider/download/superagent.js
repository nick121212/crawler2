const request = require("superagent");
const requestProxy = require("superagent-proxy")(request);
const superagent_charset = require("superagent-charset")(request);

class Downloader {
    start(uri, settings = {}, ipInfo = {}) {
        let result = {};
        let defer = Promise.defer();

        try {
            let req = request.get(uri.toString());

            if (settings.useProxy && ipInfo && ipInfo.port && ipInfo.port) {
                req.proxy(`http://${ipInfo.host}:${ipInfo.port}`);
            }
            if (settings.useProxy && settings.ipInfo && settings.ipInfo.port && settings.ipInfo.port) {
                req.proxy(`http://${settings.ipInfo.host}:${settings.ipInfo.port}`);
            }
            // 5s超时，不允许跳转
            req
                .set("User-Agent", settings.ua || "")
                .charset(settings.charset || "gbk")
                .timeout(settings.timeout || 5000)
                // .redirects(0)
                .end((err, res) => {
                    if (err) {
                        return defer.reject(err);
                    }
                    result = {
                        res: res,
                        responseBody: "",
                        urls: []
                    };
                    if (!res.text || res.statusCode !== 200) {
                        return defer.reject(new Error(`状态码(${res.statusCode})不正确。`));
                    }
                    result.responseBody = res.text;
                    defer.resolve(result);
                });
        } catch (e) {
            defer.reject(e);
        }
        return defer.promise;
    }
}
module.exports = (app) => {
    return new Downloader();
};