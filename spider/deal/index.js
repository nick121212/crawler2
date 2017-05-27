"use strict";

let _ = require("lodash");
let jpp = require("json-path-processor");


global.Promise = require("bluebird");

module.exports = (app, core) => {
    class DealHtml {
        constructor(settings, queue, getQueueItemInfo, mutiSaveFunc, saveFunc, rollbackFunc) {
            this.settings = settings;
            this.pages = settings.pages;
            this.dealKey = settings.key || "";
            this.dealAliasKey = settings.aliasKey || "";
            this.queue = queue;
            this.saveFunc = saveFunc || function() {};
            this.rollbackFunc = rollbackFunc || function() {};
            this.mutiSaveFunc = mutiSaveFunc || function() {};
            this.getQueueItemInfo = getQueueItemInfo;

            _.forEach(this.pages, (page) => {
                page.rule = _.map(page.rule, (rule) => {
                    return new RegExp(app.spider.utils.tools.replaceRegexp(rule.regexp), rule.scope);
                });
            });
        }

        /**
         * 查找规则
         * @param url {string} 链接地址
         * @returns {Array}
         */
        findRule(url) {
            return _.filter(this.pages, (page) => {
                return _.filter(page.rule, (rule) => {
                    return rule.test(url);
                }).length > 0;
            });
        }

        /**
         * 保存数据
         * @param queueItem
         * @param result 分析完成的数据值
         * @param rule   分析的规则
         * @returns {*}
         */
        save(queueItem, result, rule) {
            if (rule.checkDiff) {
                let queueItems = [];
                let results = jpp(result).get(rule.checkDiffPath).value();

                if (results) {
                    _.each(results, (res) => {
                        let queueItemNew = this.queue.queueURL(res.url, queueItem);

                        res.url = queueItemNew.url;
                        queueItemNew && (queueItemNew.res = res) && queueItems.push(queueItemNew);
                    });
                }

                return this.mutiSaveFunc(queueItems, this.dealKey, this.dealAliasKey || this.dealKey, rule.aliasKey || rule.key, rule.fieldKey);
            }

            if (rule.fieldKey && (result[rule.fieldKey] || queueItem[rule.fieldKey])) {
                return this.saveFunc(queueItem, result, this.dealAliasKey || this.dealKey, rule.key, rule.fieldKey);
            } else {
                return this.saveFunc(queueItem, result, this.dealAliasKey || this.dealKey, rule.key);
            }
        }

        /**
         * 检查状态，html解析完成后，判断数据是保存还是回滚
         * @param queueItem {Object}
         * @param results   {Object}
         * @param ch {Object} queue的channel
         * @return {Array<promise>}
         */
        checkStatus(queueItem, results) {
            let promises = [];

            _.each(results, (result) => {
                if (!result.rule.test) {
                    // 合并数据，将配置好的静态数据和解析得来的数据合并
                    result.result = _.extend({}, result.rule.extendData || {}, result.result);
                    // 判断验证模式，如果验证字段为空，则回滚数据，否则保存数据
                    if (result.rule.strict && result.rule.strictFields) {
                        if (_.reduce(result.rule.strictFields, (res, field) => {
                                return res && result.result[field];
                            }, true)) {
                            promises = promises.concat(this.save(queueItem, result.result, result.rule));
                        } else {
                            console.log(`回滚:${queueItem.url},_id:${queueItem.urlId}`);
                            promises.push(this.rollbackFunc(queueItem, this.dealKey));
                        }
                    } else {
                        promises = promises.concat(this.save(queueItem, result.result, result.rule));
                    }
                } else {
                    console.log(result.result);
                }
            });

            return promises;
        }

        /**
         * 消费一条消息,一条数据可能被多个规则匹配到，需要处理多次
         * @param queueItem {Object}
         * @param ch {Object} queue的channel
         * @return {Promise}
         */
        consumeQueue(queueItem, ch) {
            let rules = this.findRule(decodeURIComponent(queueItem.url)),
                // defer = Promise.defer(),
                promises = [];

            return new Promise((resolve, reject) => {
                if (!rules.length || !queueItem.responseBody) {
                    resolve();
                } else {
                    try {
                        // 遍历处理html文本
                        _.each(rules, (rule) => {
                            promises.push(app.spider.deal.deal.index.doDeal(queueItem, rule));
                        });
                        // 所有的处理完后，保存结果
                        Promise.all(promises).then((results) => {
                            return Promise.all(this.checkStatus(queueItem, results, ch));
                        }).then((res) => {
                            console.log(`deal complete ${queueItem.url} data ${JSON.stringify(res)} at ${new Date()}`);
                            // 更新下信息
                            // app.spider.socket.log({
                            //     message: `保存处理结果成功`,
                            //     // data: result.result
                            // });
                            resolve();
                        }).catch((err) => {
                            console.error(err);
                            // 更新下信息
                            app.spider.socket.log({
                                message: "保存处理结果失败",
                                isError: true,
                                data: err.message
                            });
                            reject(err);
                        });
                    } catch (err) {
                        reject(err);
                    }
                }
            });



            // return defer.promise;
        }
    }

    return DealHtml;
};