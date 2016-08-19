"use strict";

let uri = require("urijs");
let _ = require("lodash");
let robotsTxtParser = require("robots-parser");

module.exports = (app, core) => {
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
            this.limitMinLinks = settings.limitMinLinks || 0;

            this.queue = new app.spider.lib.queue(settings);
            this.queueStore = new app.spider.lib.queue_store_es(this.key);
            this.discover = new app.spider.lib.discover(settings, this.queue);
            this.deal = new app.spider.deal.index(settings, this.queueStore.addCompleteData.bind(this.queueStore), this.queueStore.rollbackCompleteData.bind(this.queueStore));
            this.lastError = "";
            this.doInitHtmlDeal();

            if (process.env.NODE_PIC) {
                this.doInitDownloadDeal();
            }
        }

        /**
         * 爬取一个链接
         * @param queueItem
         */
        fetchQueueItem(queueItem) {
            let defer = Promise.defer();

            try {
                this.lastTime = Date.now();
                // 开始下载页面"
                app.spider.download.index.start(this.downloader, uri(queueItem.url).normalize(), this.proxySettings || {}).then((result) => {
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
            let next = (msg, reject = false, interval = this.interval) => {
                if (interval == this.interval) {
                    interval = ~~(Math.random() * (interval - 500) + 500);
                }

                setTimeout(function() {
                    reject ? result.ch.reject(msg) : result.ch.ack(msg);
                }, interval);
            };
            let errPage = () => {
                let err = new Error("下载的页面不正确!");

                err.status = 601;
                throw err;
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
                queueItem.url = decodeURIComponent(queueItem.url);
                // 开始下载页面
                this.fetchQueueItem(queueItem).then((data) => {
                    let defer = Promise.defer();
                    // 检测下下载的页面是否有error
                    if (this.deal.pages.error) {
                        app.spider.deal.deal.index.doDeal(data, this.deal.pages.error).then((result) => {
                            _.forEach(result.result, (val) => {
                                if (val) {
                                    return errPage();
                                }
                            });
                            defer.resolve(data);
                        }, defer.reject);
                    } else {
                        defer.resolve(data);
                    }

                    return defer.promise;
                }).then((data) => {
                    // 处理页面中的链接
                    let discoverUrls = this.discover.discoverResources(data.responseBody, queueItem) || [];

                    if (discoverUrls.length < this.limitMinLinks) {
                        return errPage();
                    }
                    // 发现并过滤页面中的urls
                    discoverUrls.map((url) => {
                        url = this.queue.queueURL(decodeURIComponent(url), queueItem);
                        if (url) {
                            let rules = this.deal.findRule(decodeURIComponent(url.url));

                            if (rules.length) {
                                url.priority = rules[0].priority || 1;
                                url.rule = rules[0];
                            }
                            urls.push(url);
                        }
                    }, this);
                    // 把搜索到的地址存入到es
                    if (urls.length) {
                        return this.queueStore.addUrlsToEsUrls(urls, this.key);
                    }
                }).then(() => {
                    delete errors[queueItem.urlId];
                    this.lastError = "";
                    next(msg);
                }).catch((err) => {
                    // 可能是页面封锁机制,爬取到的页面是错误的
                    if (err.status === 601) {
                        return next(msg, true, 1000 * 60 * 5);
                    }
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

                    this.lastError = err.message;
                    // 如果错误数超过200，丢弃掉消息
                    if (errors[queueItem.urlId] >= 200) {
                        delete errors[queueItem.urlId];
                        return this.queueStore.addCompleteQueueItem(queueItem, "", this.key, "error").then(next.bind(this, msg), next.bind(this, msg));
                    }
                    next(msg, true);
                });
            } catch (err) {
                next(msg);
            }
        }

        /**
         * 循环获取链接
         */
        doLoop() {
            let defer = Promise.defer();

            // 建立请求队列
            core.q.getQueue(`crawler.urls.${this.key}`, {}).then((result) => {
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
            core.q.getQueue(`crawler.deals.${this.key}`, { durable: true }).then((result) => {
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
                                this.deal.consumeQueue(queueItem, result.ch).then(() => {
                                    result.ch.ack(msg);
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
         * 初始化html处理部分的queue
         */
        doInitDownloadDeal() {
            core.q.getQueue(`crawler.downloader.picture`, { durable: true }).then((result) => {
                Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]).then(() => {
                    // 开始消费
                    result.ch.consume(result.q.queue, (msg) => {
                        let URL = msg.content.toString();

                        app.spider.download.index.start("request", URL, this.proxySettings || {}).then(() => {
                            result.ch.ack(msg);
                        }).catch((err) => {
                            result.ch.reject(msg);
                            console.log(err);
                        });
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

            // 如果有这个变量,则不开启下载
            if (process.env.NODE_FETCH) {
                this.isStart = true;
                return;
            }

            let robotsTxtUrl = uri(this.host).pathname("/robots.txt");
            let next = () => {
                setTimeout(function() {
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