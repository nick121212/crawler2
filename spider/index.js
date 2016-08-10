"use strict";

let uri = require("urijs");
let _ = require("lodash");
let robotsTxtParser = require("robots-parser");

module.exports = (app, core)=> {
    const errors = {};

    class Crawler {
        /**
         * 构造函数
         * settings {object}
         *   initialPath       boolean 初始化连接地址
         *   initialPort       boolean 初始化端口
         *   initialProtocol   array   初始化协议
         *   host              string  初始化host
         *   cluster           boolean 是否是从
         **/
        constructor(settings) {
            this.initialPath = settings.initialPath || "/";
            this.initialPort = settings.initialPort || 80;
            this.initialProtocol = settings.initialPort || "http";
            this.host = settings.host;
            this.key = settings.key;
            this.robotsHost = settings.robotsHost;
            this.isStart = false;
            this.downloader = settings.downloader || "superagent";
            this.interval = settings.interval || 500;
            this.lastTime = Date.now();
            this.proxySettings = settings.proxySettings || {};
            this.initDomain = settings.initDomain || {};
            this.ignoreStatusCode = settings.ignoreStatusCode || [302, 400, 404, 500, "ENOTFOUND", "ECONNABORTED"];

            this.queue = new app.spider.lib.queue(settings);
            this.queueStore = new app.spider.lib.queue_store_es(this.key);
            this.discover = new app.spider.lib.discover(settings, this.queue);
            this.deal = new app.spider.deal.index(settings, this.queueStore.addCompleteData.bind(this.queueStore), this.queueStore.rollbackCompleteData.bind(this.queueStore));

            this.doInitHtmlDeal();
        }

        /**
         * 爬取一个链接
         * @param queueItem
         */
        fetchQueueItem(queueItem) {
            let defer = Promise.defer();
            let URL = queueItem.protocol + "://" + queueItem.host + (queueItem.port !== 80 ? ":" + queueItem.port : "") + queueItem.path;

            try {
                this.lastTime = Date.now();
                // 开始下载页面
                app.spider.download.index.start(this.downloader, uri(URL).normalize(), this.proxySettings || {}).then((result) => {
                    result.res && (queueItem.stateData = result.res.headers);
                    // 保存下载下来的页面
                    return this.queueStore.addCompleteQueueItem(queueItem, result.responseBody, this.key).then(res => defer.resolve(result), (err) => {
                        err.status = null;
                        defer.reject(err);
                    });
                }).catch(defer.reject);
            } catch (err) {
                console.err(err);
                defer.reject(err);
            }

            return defer.promise;
        }

        /**
         * 处理一条queue数据
         * @param msg
         * @param result
         */
        consumeQueue(msg, result) {
            let urls = [],
                queueItem;
            let next = (msg, reject = false) => {
                setTimeout(function () {
                    reject ? result.ch.reject(msg) : result.ch.ack(msg);
                }, this.interval);
            };

            try {
                queueItem = JSON.parse(msg.content.toString());
                if (!queueItem || typeof queueItem.url !== "string") {
                    return this.queueStore.addCompleteQueueItem(queueItem, "", this.key, "error").then(next.bind(this, msg), next.bind(this, msg));
                }

                if (!this.discover.pathSUpported(decodeURIComponent(queueItem.path))) {
                    return next(msg);
                }

                console.log(`start fetch ${queueItem.url} depth:${queueItem.depth} at ${new Date()}`);
                // 请求页面
                this.fetchQueueItem(queueItem).then((data) => {
                    // 发现并过滤页面中的urls
                    this.discover.discoverResources(data.responseBody, queueItem).map((url) => {
                        url = this.queue.queueURL(decodeURIComponent(url), queueItem);
                        url && urls.push(url);
                    }, this);
                    // 把搜索到的地址存入到es
                    if (urls.length) {
                        return this.queueStore.addUrlsToEsUrls(urls, this.key);
                    }
                    return null;
                }).then(() => {
                    delete errors[queueItem.urlId];
                    next(msg);
                }).catch((err) => {
                    // 错误重试机制
                    if (!errors[queueItem.urlId]) {
                        errors[queueItem.urlId] = 0;
                    }
                    // 在定义的错误列表中，加速错误
                    if (_.indexOf(this.ignoreStatusCode, err.status) >= 0 || _.indexOf(this.ignoreStatusCode, err.code) >= 0) {
                        errors[queueItem.urlId] += 20;
                    } else {
                        errors[queueItem.urlId]++;
                    }
                    console.error(err.status, err.code, err.message, errors[queueItem.urlId]);
                    // 如果错误数超过200，丢弃掉消息
                    if (errors[queueItem.urlId] >= 200) {
                        delete errors[queueItem.urlId];
                        return this.queueStore.addCompleteQueueItem(queueItem, "", this.key, "error").then(next.bind(this, msg), next.bind(this, msg));
                    }
                    next(msg, true);
                });
            } catch (e) {
                next(msg);
            }
        }

        /**
         * 循环获取链接
         */
        doLoop() {
            let defer = Promise.defer();

            // 建立请求队列
            core.q.getQueue(`crawler.urls.${this.key}`, {durable: true}).then((result) => {
                Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}.urls`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]).then(() => {
                    // 添加消费监听
                    result.ch.consume(result.q.queue, (msg) => {
                        this.consumeQueue(msg, result);
                    }, {
                        noAck: false
                    });

                    defer.resolve();
                });
            }, console.error);

            return defer.promise;
        }

        /**
         * 初始化html处理部分的queue
         */
        doInitHtmlDeal() {
            core.q.getQueue(`crawler.deals.${this.key}`, {durable: true}).then((result) => {
                Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}.bodys`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]).then(() => {
                    // 开始消费
                    result.ch.consume(result.q.queue, (msg) => {
                        let queueItem;
                        try {
                            queueItem = JSON.parse(msg.content.toString());
                        } catch (e) {
                            result.ch.reject(msg);
                        }
                        try {
                            if (queueItem) {
                                this.deal.consumeQueue(queueItem).then(() => {
                                    result.ch.ack(msg);
                                    // result.ch.reject(msg);
                                }, (err) => {
                                    console.log(err);
                                    result.ch.reject(msg);
                                });
                            }
                        } catch (e) {
                            console.log(e);
                            result.ch.reject(msg);
                        }
                    });
                }, console.error);
            });
        }

        /**
         * 获取机器人应答信息
         * @param robotsTxtUrl
         */
        getRobotsTxt(robotsTxtUrl) {
            let defer = Promise.defer();
            let robotsTxts = [];

            if (robotsTxtUrl) {
                robotsTxtUrl = this.queue.processURL(robotsTxtUrl.toString());
                robotsTxtUrl = this.queueStore.getQueueItemInfo(robotsTxtUrl.protocol, robotsTxtUrl.host, robotsTxtUrl.port, robotsTxtUrl.path, robotsTxtUrl.depth);
                app.spider.download.index.start("superagent", robotsTxtUrl.url).then((results) => {
                    robotsTxts.push(robotsTxtParser(robotsTxtUrl.url, results.responseBody));
                    defer.resolve(robotsTxts);
                }).catch((err) => {
                    if (err.status === 301 && err.response.headers.location) {
                        let redirectTarget = uri(err.response.headers.location)
                            .absoluteTo(robotsTxtUrl.url)
                            .normalize();
                        this.getRobotsTxt(redirectTarget).then(defer.resolve, defer.reject);
                    } else {
                        defer.reject(err);
                    }
                });
            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        /**
         * 开始爬取数据
         */
        doStart() {
            if (!this.host) {
                throw new Error("host不能为空！");
            }

            let robotsTxtUrl = uri(this.host).pathname("/robots.txt");
            let next = () => {
                setTimeout(function () {
                    this.queueStore.addUrlsToEsUrls([{
                        protocol: this.initialProtocol,
                        host: this.initDomain || this.host,
                        port: this.initialPort,
                        path: this.initialPath,
                        depth: 1
                    }], this.key);
                }.bind(this), 500);
            };
            // 获得机器人信息
            this.getRobotsTxt(robotsTxtUrl).then((robots) => {
                this.discover._robotsTxts = robots;
                this.doLoop().then(next.bind(this));
            }, (err) => {
                console.error(err);
                this.doLoop().then(next.bind(this));
            });
            this.isStart = true;
        }
    }

    return Crawler;
};