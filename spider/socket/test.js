/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");
let uri = require("urijs");
let _ = require('lodash');

module.exports = exports = (app, core, socket) => {
    socket.on("crawler:test", (params, cb)=> {
        let config = params.key;

        app.spider.download.index.start("superagent", uri(params.options.url).normalize(), config.proxySettings || {}).then((result) => {
            if (result.res && result.res.status !== 200) {
                cb({
                    ret: -1,
                    msg: result.res.statusText
                });
            } else {
                let promises = [];
                let deal = new app.spider.deal.index(config);
                let rules = deal.findRule(params.options.url);

                // 遍历处理html文本
                _.each(rules, (rule) => {
                    promises.push(app.spider.deal.deal.index.doDeal(result, rule));
                });

                // 所有的处理完后，保存结果
                Promise.all(promises).then((results) => {
                    let res = {ret: 0, data: [], showResult: true};

                    _.each(results, (result)=> {
                        "use strict";
                        res.data.push(result.result);
                    });

                    cb(res);
                }).catch((err) => {
                    err.ret = -1;
                    cb(err);
                });
            }

            return result;
        });
    });
};