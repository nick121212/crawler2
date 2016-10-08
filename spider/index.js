"use strict";

let uri = require("urijs");
let _ = require("lodash");
let robotsTxtParser = require("robots-parser");
let currentInterval = 0;

module.exports = (app, core, socket) => {
    const errors = {};
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
            this.isStartDownload = false;

            this.initialPath = settings.initialPath || "/";
            this.initialPort = settings.initialPort || 80;
            this.initialProtocol = settings.initialPort || "http";
            this.host = settings.host;
            this.key = settings.key;
            this.robotsHost = settings.robotsHost;

            this.downloader = settings.downloader || "superagent";
            this.interval = settings.interval || 500;
            this.proxySettings = settings.proxySettings || {};
            this.initDomain = settings.initDomain || {};
            this.ignoreStatusCode = settings.ignoreStatusCode || [301, 302, 400, 404, 500, "ENOTFOUND", "ECONNABORTED"];
            this.limitMinLinks = settings.limitMinLinks || 0;

            this.queue = new app.spider.lib.queue(settings);
            this.queueStore = new app.spider.lib.queue_store_es(this.key);
            this.discover = new app.spider.lib.discover(settings, this.queue);
            this.deal = new app.spider.deal.index(settings, this.queueStore.addCompleteData.bind(this.queueStore), this.queueStore.rollbackCompleteData.bind(this.queueStore));

            app.spider.socket.update({
                downloader: this
            });
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
                    let errorDeal = _.filter(this.deal.pages, (page)=> {
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
            let next = (msg, reject = false, interval = this.interval) => {
                if (interval == this.interval) {
                    interval = ~~(Math.random() * (interval - 500) + 500);
                }

                currentInterval = interval;
                reject ? result.ch.reject(msg) : result.ch.ack(msg);
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
                    // 处理页面中的链接
                    let discoverUrls = this.discover.discoverResources(data.responseBody, queueItem) || [];

                    console.log(`处理链接数量${discoverUrls.length} at ${new Date()}`);
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
                    next(msg);
                }).catch((err) => {
                    app.spider.socket.log({
                        message: `${queueItem.url}--${err.message}--${err.status}--${err.code}`,
                        isError: true,
                        date: Date.now()
                    });

                    // 可能是页面封锁机制,爬取到的页面是错误的
                    console.error(err.status, err.code, err.message, errors[queueItem.urlId]);


                    // 错误重试机制
                    if (!errors[queueItem.urlId]) {
                        errors[queueItem.urlId] = 0;
                    }
                    // 在定义的错误列表中，加速错误
                    if (_.indexOf(this.ignoreStatusCode, err.status) >= 0 || _.indexOf(this.ignoreStatusCode, err.code) >= 0) {
                        errors[queueItem.urlId] += 40;
                    } else {
                        errors[queueItem.urlId]++;
                    }

                    if ((err.status === 502 && this.proxySettings.useProxy) || (err.status === 601 && this.proxySettings.useProxy) || (err.code === "ECONNABORTED" && this.proxySettings.useProxy)) {
                        // 重启更换ip服务
                        if (err.status === 601 || errors[queueItem.urlId] > 150) {
                            console.log("-----------------在此更改ip。。。--------------");
                            app.spider.socket.log({
                                message: `发送更换IP请求！！`,
                                isError: true,
                                date: Date.now()
                            });
                            socket.emit("crawler:chip");
                        }

                        errors[queueItem.urlId] = 50;

                        return next(msg, true, 1000 * 60 * (~~this.proxySettings.errorInterval || 0.1));
                    }

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
                        console.log(`等待${currentInterval}毫秒！！！！`);
                        setTimeout(()=> {
                            this.consumeQueue(msg, result);
                        }, currentInterval);
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
            let next = (queueItem, result, msg)=> {
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
                    result.ch.consume(result.q.queue, (msg) => {
                        let queueItem;
                        try {
                            queueItem = JSON.parse(msg.content.toString());
                        } catch (e) {
                            result.ch.reject(msg);
                        }
                        try {
                            if (queueItem) {
                                if (queueItem.responseBody) {
                                    next(queueItem, result, msg);
                                } else {
                                    this.queueStore.getRsBody(queueItem).then((response)=> {
                                        if (response.found) {
                                            queueItem.responseBody = response._source.text;
                                            return next(queueItem, result, msg);
                                        }

                                        result.ch.reject(msg);
                                    }, ()=> {
                                        console.log(err);
                                        result.ch.reject(msg);
                                    });
                                }
                            }
                        } catch (e) {
                            console.log(e);
                            result.ch.reject(msg);
                        }
                    });
                }, (e)=> {
                    this.isStartDownload = false;
                    console.error(e);
                });
            });
        }

        /**
         * 初始化下载图片的queue
         */
        doInitDownloadDeal() {
            this.isStartDownload = true;
            core.q.getQueue(`crawler.downloader.picture`, {durable: true}).then((result) => {
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
                }, (e)=> {
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