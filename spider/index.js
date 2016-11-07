"use strict";

let uri = require("urijs");
let _ = require("lodash");
let robotsTxtParser = require("robots-parser");
let currentInterval = 0;

module.exports = (app, core) => {
    const errPage = () => {
        let err = new Error("下载的页面不正确!");
        err.status = 601;

        return err;
    };

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
            this.isStart = false;
            this.isStartDeal = false;
            this.isDispatch = false;
            this.consumerTags = [];

            this.initialPath = settings.initialPath || "/";
            this.initialPort = settings.initialPort || 80;
            this.initialProtocol = settings.initialPort || "http";
            this.host = settings.host;
            this.key = settings.key;
            this.aliasKey = settings.aliasKey;
            this.robotsHost = settings.robotsHost;

            this.downloader = settings.downloader || "superagent";
            this.interval = settings.interval || 500;
            this.proxySettings = settings.proxySettings || {};
            this.initDomain = settings.initDomain || {};
            this.ignoreStatusCode = settings.ignoreStatusCode || [301, 302, 400, 404, 500, "ENOTFOUND"];
            this.limitMinLinks = settings.limitMinLinks || 0;

            this.queue = new app.spider.lib.queue(settings);
            this.queueStore = new app.spider.lib.queue_store_es(this.key);
            this.discover = new app.spider.lib.discover(settings, this.queue);
            this.deal = new app.spider.deal.index(settings, this.queue, this.queueStore.getQueueItemInfo.bind(this.queueStore), this.queueStore.addMutipleCompleteData.bind(this.queueStore), this.queueStore.addCompleteData.bind(this.queueStore), this.queueStore.rollbackCompleteData.bind(this.queueStore));
        }

        /**
         * 爬取一个链接
         * @param queueItem
         */
        fetchQueueItem(queueItem) {
            let defer = Promise.defer();

            try {
                // 开始下载页面
                app.spider.download.index.start(this.downloader, uri(queueItem.url).normalize(), this.proxySettings || {}).then((result) => {
                    result.res && (queueItem.stateData = result.res.headers);

                    if (result.res && result.res.status !== 200) {
                        let err = new Error(result.res.statusText);
                        err.status = result.res.status;
                        throw err;
                    }

                    return result;
                }).then((result) => {
                    let defer = Promise.defer();

                    // 检测下下载的页面是否有error
                    let errorDeal = _.filter(this.deal.pages, (page) => {
                        return page.key === "error";
                    });

                    if (errorDeal.length) {
                        app.spider.deal.deal.index.doDeal(result, errorDeal[0]).then((res) => {
                            let isError = false;
                            _.forEach(res.result, (val) => {
                                if (val) {
                                    isError = true;
                                    return false;
                                }
                            });
                            isError ? defer.reject(errPage()) : defer.resolve(result);
                        }, defer.reject);
                    } else {
                        defer.resolve(result);
                    }

                    return defer.promise;
                }).then((result) => {
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
            let next = (queueMsg, reject = false, interval = this.interval) => {
                if (interval == this.interval) {
                    interval = ~~(Math.random() * (interval - 500) + 500);
                }
                currentInterval = interval;
                reject ? result.ch.reject(queueMsg) : result.ch.ack(queueMsg);
            };

            try {
                queueItem = JSON.parse(msg.content.toString());

                if (!queueItem || typeof queueItem.url !== "string") {
                    return this.queueStore.addCompleteQueueItem(queueItem, "", this.key, "error").then(next.bind(this, msg), next.bind(this, msg));
                }

                // 判断路径是否支持，不支持则不处理该链接
                if (!this.discover.pathSUpported(decodeURIComponent(queueItem.path))) {
                    return next(msg);
                }

                console.log(`start fetch ${queueItem.url} depth:${queueItem.depth} at ${new Date()}`);
                // 请求页面
                queueItem.url = decodeURIComponent(queueItem.url);
                // 开始下载页面
                this.fetchQueueItem(queueItem).then((data) => {
                    // 处理页面中的链接
                    let discoverUrls = this.discover.discoverResources(data.responseBody, queueItem) || [];
                    // 发送日志
                    app.spider.socket.log({
                        message: `${queueItem.url}--处理链接数量{${discoverUrls.length}}`,
                        isError: false,
                        url: queueItem.url
                    });

                    if (discoverUrls.length < this.limitMinLinks) {
                        throw errPage();
                    }
                    // 发现并过滤页面中的urls
                    discoverUrls.map((url) => {
                        url = this.queue.queueURL(decodeURIComponent(url), queueItem);
                        if (url) {
                            let rules = this.deal.findRule(decodeURIComponent(url.path));

                            if (rules.length) {
                                url.priority = rules[0].priority || 1;
                                url.rule = rules[0];
                            }
                            urls.push(url);
                        }
                    }, this);
                    // 把搜索到的地址存入到es
                    if (urls.length) {
                        return this.queueStore.addUrlsToEsUrls(urls, this.key, this.aliasKey);
                    }
                }).then(() => {
                    app.spider.lib.error.success(queueItem, next.bind(this, msg));
                }).catch((err) => {
                    app.spider.lib.error.error(err, queueItem, next.bind(this, msg));
                });
            } catch (err) {
                next(msg);
            }
        }

        /**
         * 循环获取链接
         */
        doInitDownloadDeal() {
            let result;

            // 建立请求队列
            return core.q.getQueue(`crawler.urls.${this.key}`, {}).then((res) => {
                result = res;

                return Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}.urls`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]);
            }).then(() => {
                // 发送日志消息

                // 添加消费监听
                return result.ch.consume(result.q.queue, (msg) => {
                    this.isStart = true;
                    console.log(`等待${currentInterval}毫秒！！！！`);
                    setTimeout(() => {
                        this.consumeQueue(msg, result);
                    }, currentInterval);
                }, {
                    noAck: false
                });
            }).then((qres) => {
                app.spider.lib.dispatch.checkQueue(result.q.queue);
                this.dealConsumer(qres.consumerTag);
            }).catch(console.error);
        }

        // 保存所有的消费者tag
        dealConsumer(consumerTag) {
            this.consumerTags.push(consumerTag);
            this.consumerTags = _.uniq(this.consumerTags);
        }

        /**
         * 初始化html处理部分的queue
         */
        doInitHtmlDeal() {
            let next = (queueItem, result, msg) => {
                this.deal.consumeQueue(queueItem, result.ch).then(() => {
                    result.ch.ack(msg);
                }, (err) => {
                    console.log(err);
                    result.ch.reject(msg);
                });
            };

            this.isStartDeal = true;
            core.q.getQueue(`crawler.deals.${this.key}`, {durable: true}).then((result) => {
                Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}.bodys`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]).then(() => {
                    // 开始消费
                    return result.ch.consume(result.q.queue, (msg) => {
                        let queueItem;

                        this.dealConsumer(msg.fields.consumerTag);
                        try {
                            queueItem = JSON.parse(msg.content.toString());
                            // 判定，如果message中不存在responseBody，则直接从数据库中提取
                            if (queueItem.responseBody) {
                                return next(queueItem, result, msg);
                            }

                            this.queueStore.getRsBody(queueItem).then((response) => {
                                if (response.found) {
                                    queueItem.responseBody = response._source.text;
                                    return next(queueItem, result, msg);
                                }
                                result.ch.reject(msg);
                            }, (err) => {
                                console.log(err);
                                result.ch.reject(msg);
                            });
                        } catch (e) {
                            console.log(e);
                            result.ch.reject(msg);
                        }

                    });
                }).catch((e) => {
                    this.isStartDownload = false;
                    console.error(e);
                });
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
            if (this.isStart) {
                return;
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
            }, console.error).chain(() => {
                this.doInitDownloadDeal().then(next.bind(this));
            });
            this.isStart = true;
        }

        /**
         * 停止爬取数据
         */
        doStop() {
            let promises = [];
            if (this.isStart) {
                _.each(this.consumerTags, (tag) => {
                    promises.push(core.q.cancel(tag));
                });

                return Promise.all(promises).then(() => {
                    this.isStart = false;
                    this.isStartDeal = false;
                    this.consumerTags.length = 0;
                    app.spider.socket.log({
                        message: "已经停止爬虫"
                    });
                    app.spider.socket.update({
                        downloader: core.downloadInstance
                    });
                }).catch(console.error);
            }
        }

        /**
         * 调度模式
         */
        doDispatch() {
            app.spider.lib.dispatch.scheduleJob();
            this.isDispatch = true;
        }
    }

    return Crawler;
};