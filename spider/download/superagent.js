const request = require("superagent");
const requestProxy = require("superagent-proxy")(request);
const superagent_charset = require("superagent-charset")(request);


class Downloader {
    start(uri, settings = {}, ipInfo = {}) {
        let result = {};

        return new Promise((resolve, reject) => {
            try {
                let req = request.get(uri.toString());

                // if (settings.useProxy && settings.ipInfo && settings.ipInfo.port && settings.ipInfo.port) {
                //     req.proxy(`http://${settings.ipInfo.host}:${settings.ipInfo.port}`);
                // }
                // 5s超时，不允许跳转
                req
                    .set("User-Agent", settings.ua || "")
                    .charset(settings.charset || "gbk")
                    .timeout(settings.timeout || 5000)
                    // .redirects(0)
                    .end((err, res) => {
                        if (err) {
                            return reject(err);
                        }
                        result = {
                            res: res,
                            responseBody: "",
                            urls: []
                        };
                        if (!res.text || res.statusCode !== 200) {
                            return reject(new Error(`状态码(${res.statusCode})不正确。`));
                        }
                        result.responseBody = res.text;
                        resolve(result);
                    });
            } catch (e) {
                reject(e);
            }
        });

    }
}
module.exports = (app) => {
    return new Downloader();
};