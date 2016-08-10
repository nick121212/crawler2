"use strict";

let _ = require("lodash");

module.exports = (app)=> {
    class DealHtml {
        constructor(settings, saveFunc, rollbackFunc) {
            this.settings = settings;
            this.pages = settings.pages;
            this.dealKey = settings.key || "";
            this.saveFunc = saveFunc || function () {
                };
            this.rollbackFunc = rollbackFunc || function () {
                };

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
                return _.some(page.rule, (rule) => {
                    return rule.test(url);
                });
            });
        }

        /**
         * 检查状态，html解析完成后，判断数据是保存还是回滚
         * @param queueItem {Object}
         * @param results   {Object}
         * @return {Array<promise>}
         */
        checkStatus(queueItem, results) {
            let promises = [];

            let save = (queueItem, result, rule) => {
                if (rule.fieldKey && (result[rule.fieldKey] || queueItem[rule.fieldKey])) {
                    promises.push(this.saveFunc(queueItem, result, this.dealKey, rule.key, rule.fieldKey));
                } else {
                    promises.push(this.saveFunc(queueItem, result, this.dealKey, rule.key));
                }
            };

            _.each(results, (result) => {
                if (!result.rule.test) {
                    // 合并数据，将配置好的静态数据和解析得来的数据合并
                    result.result = _.extend({}, result.rule.extendData || {}, result.result);
                    // 判断验证模式，如果验证字段为空，则回滚数据，否则保存数据
                    if (result.rule.strict && result.rule.strictField) {
                        if (result.result[result.rule.strictField]) {
                            save(queueItem, result.result, result.rule);
                        } else {
                            console.log(`回滚:${queueItem.url},_id:${queueItem.urlId}`);
                            promises.push(this.rollbackFunc(queueItem));
                        }
                    } else {
                        save(queueItem, result.result, result.rule);
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
         * @return {Promise}
         */
        consumeQueue(queueItem) {
            let rules = this.findRule(decodeURIComponent(queueItem.url)),
                defer = Promise.defer(),
                promises = [];

            if (!rules.length || !queueItem.responseBody) {
                defer.resolve();
            } else {
                try {
                    // 遍历处理html文本
                    _.each(rules, (rule) => {
                        promises.push(app.spider.deal.deal.index.doDeal(queueItem, rule));
                    });
                    // 所有的处理完后，保存结果
                    Promise.all(promises).then((results) => {
                        return Promise.all(this.checkStatus(queueItem, results));
                    }).then(() => {
                        console.log(`deal complete ${queueItem.url} at ${new Date()}`);
                        defer.resolve();
                    }).catch((err) => {
                        console.error(err);
                        defer.reject(err);
                    });
                } catch (err) {
                    defer.reject(err);
                }
            }

            return defer.promise;
        }
    }

    return DealHtml;
};