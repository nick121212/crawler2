"use strict";

let _ = require("lodash");
let md5 = require("blueimp-md5");


module.exports = (app, core)=> {
    /**
     * 数据存储在es里面
     * queue队列存储在rabbitmq里面
     * 多个程序启动时，通过读Q来爬取链接
     */
    class QueueStoreOfES {
        constructor(index) {
            // es中的index
            this.esIndex = `${index}-crawler-allin`;
            this.esTypeUrls = "urls";
            this.esTypeRsbody = "rsbody";
            this.esTypeQueueUrls = "mqurls";
        }

        /**
         * 获取id为queueItem.url的urls和queuqUrls中的详情信息
         * @param ququeItem {object} 数据
         * @returns {promise}
         */
        getUrlAndQUrlDetail(queueItem) {
            let defer = Promise.defer();

            core.elastic.mget({
                body: {
                    docs: [{
                        _index: this.esIndex,
                        _type: this.esTypeUrls,
                        _id: queueItem.urlId
                    }, {
                        _index: this.esIndex,
                        _type: this.esTypeQueueUrls,
                        _id: queueItem.urlId
                    }]
                }
            }).then((data) => {
                defer.resolve({
                    esUrl: {
                        exists: data.docs[0].found,
                        detail: data.docs[0]._source
                    },
                    esQueueUrl: {
                        exists: data.docs[1].found,
                        detail: data.docs[1]._source
                    }
                });
            }, (err) => {
                console.log(queueItem);
                defer.reject(err);
            });

            return defer.promise;
        }

        /**
         * 根据protocol，host，post，path，depth来获取queueItem
         * @param protocol {string} 协议
         * @param host {string} 域名
         * @param port {Number} 端口
         * @param path {string} 路径
         * @param depth {string} 深度
         * @returns {queueItem}
         */
        getQueueItemInfo(protocol, host, port, path, depth) {
            let url, queueItem;

            if (isNaN(port) || !port) {
                port = 80;
            }
            depth = depth || 1;
            protocol = protocol === "https" ? "https" : "http";
            url = protocol + "://" + host + (port !== 80 ? ":" + port : "") + path;
            queueItem = {
                url: url,
                urlId: md5(url),
                protocol: protocol,
                host: host,
                port: port,
                path: path,
                depth: depth,
                fetched: false,
                status: "queued",
                createDate: Date.now(),
                stateData: {}
            };

            return queueItem;
        }

        /**
         * 添加数据到列表
         * @param protocol {string} 协议
         * @param host {string} 域名
         * @param port {string} 端口
         * @param path {string} 路径
         * @param depth {string} 深度
         * @returns {Promise}
         */
        checkUrlDetail(queueItem) {
            let defer = Promise.defer();

            this.getUrlAndQUrlDetail(queueItem).then((data) => {
                if (!data.esUrl.exists && !data.esQueueUrl.exists) {
                    return defer.resolve(queueItem);
                }
                if (!data.esQueueUrl.exists && !data.esUrl.detail) {
                    return defer.resolve(queueItem);
                }
                if (!data.esQueueUrl.exists && !data.esUrl.detail.fetched) {
                    return defer.resolve(queueItem);
                }
                defer.resolve({
                    isError: true,
                    url: queueItem.urlId,
                    err: new Error("queueItem不需要再爬取了！")
                });
            }, defer.reject);

            return defer.promise;
        }

        /**
         * 添加es中的数据
         * @param data        {object}   数据
         * @param type        {string}   类型
         * @param index       {string}   索引
         * @returns {promise}
         */
        indexEsData(data, idField, type, index) {
            let defer = Promise.defer();
            let config = {
                index: index || this.esIndex,
                type: type,
                body: data,
                consistency: "one"
            };

            if (idField !== "randow") {
                config.id = data[idField];
            }

            console.log(config);

            core.elastic.index(config).then(() => {
                defer.resolve(data);
            }, (err) => {
                defer.reject(err);
            });

            return defer.promise;
        }

        /**
         * 添加urls到esurls和queue
         * @param urls {Array} 链接数组
         * @returns {Promise}
         */
        addUrlsToEsUrls(urls, key) {
            let queueItems = {};
            let defer = Promise.defer();
            let esMgetBody = [];

            // 检查url在es中是否存在
            _.each(urls, (url) => {
                let queueItem = this.getQueueItemInfo(url.protocol, url.host, url.port, url.path, url.depth);
                queueItems[queueItem.urlId] = queueItem;
            }, this);
            // mget一下数据
            _.each(queueItems, (queueItem) => {
                esMgetBody.push({
                    _index: this.esIndex,
                    _type: this.esTypeUrls,
                    _id: queueItem.urlId,
                    fields: ["fetched"]
                });
                esMgetBody.push({
                    _index: this.esIndex,
                    _type: this.esTypeQueueUrls,
                    _id: queueItem.urlId,
                    fields: ["fetched"]
                });
            });

            // 处理数据,先判断queueUrl中是否存在,存在则不添加到queue
            // 判断urls中是否存在,如果存在,则判断数据是否已经fetched,如果没有则加到queue里
            core.elastic.mget({
                body: {
                    docs: esMgetBody
                }
            }).then((results) => {
                let urlRes, queueUrlRes, esBulkBody = [];

                for (let i = 0, n = results.docs.length; i < n; i += 2) {
                    urlRes = results.docs[i];
                    queueUrlRes = results.docs[i + 1];

                    // queue数据库中是否存在
                    if (queueUrlRes.found) { // && queueUrlRes.fields["fetched"].length && !queueUrlRes.fields["fetched"][0]) {
                        continue;
                    }
                    // url数据库中是否存在,判断fetched
                    if (urlRes.found && urlRes.fields["fetched"].length && urlRes.fields["fetched"][0]) {
                        continue;
                    }
                    // 存储需要新建到queue里的数据数组
                    if (queueItems[urlRes._id]) {
                        esBulkBody.push({
                            create: {
                                _index: this.esIndex,
                                _type: this.esTypeQueueUrls,
                                _id: urlRes._id
                            }
                        });
                        esBulkBody.push(queueItems[urlRes._id]);
                    }
                }

                return esBulkBody;
            }, defer.reject).then((esBulkBody) => {
                let newQueueItems = [];

                if (!esBulkBody.length) {
                    return defer.resolve();
                }

                // 新建数据,并添加到queue
                core.elastic.bulk({
                    body: esBulkBody
                }).then((response) => {
                    _.each(response.items, (createResult) => {
                        createResult = createResult.create;
                        (createResult.status === 201) && queueItems[createResult._id] && newQueueItems.push(queueItems[createResult._id]);
                    });
                    newQueueItems.length && this.addQueueItemsToQueue(newQueueItems, key).then(defer.resolve, defer.reject);
                }, defer.reject);
            });

            return defer.promise;
        }

        /**
         * 当一个url完成爬取后，把数据添加到esUrls中，删除esQueueUrls中的数据，最后把爬取下来的数据存到esReBody中
         * @param queueItem    {object}   url的详情
         * @param responseBody {string}   url的页面信息
         * @param key          {string}   key，区分不同网站
         * @param status       {string}   网页的下载状态，error：错误，downloaded：已下载
         * @returns {Promise}
         */
        addCompleteQueueItem(queueItem, responseBody, key, status = "downloaded") {
            let defer = Promise.defer();
            let opts = [];
            let isError = !responseBody || status === "error";

            this.checkUrlDetail(queueItem).then(() => {
                queueItem.fetched = true;
                queueItem.updateDate = Date.now();
                queueItem.status = status;

                // 删除mqurl中的数据
                opts.push({
                    delete: {
                        _index: this.esIndex,
                        _type: this.esTypeQueueUrls,
                        _id: queueItem.urlId
                    }
                });
                if (!isError) {
                    opts = opts.concat([{
                        create: {
                            _index: this.esIndex,
                            _type: this.esTypeUrls,
                            _id: queueItem.urlId
                        }
                    }, queueItem]);
                    opts = opts.concat([{
                        create: {
                            _index: this.esIndex,
                            _type: this.esTypeRsbody,
                            _id: queueItem.urlId
                        }
                    }, {
                        urlId: queueItem.urlId,
                        url: queueItem.url,
                        text: responseBody
                    }]);
                }
                core.elastic.bulk({
                    body: opts
                }).then(() => {
                    if (!isError) {
                        return this.addCompleteQueueItemsToQueue(queueItem, responseBody, key);
                    }
                    return null;
                }, defer.reject).then(defer.resolve, defer.reject);
            }, defer.reject);

            return defer.promise;
        }

        /**
         * 添加URLS到Queue
         * @param queueItems {Array} queueItem列表
         * @param key {String} 标志
         * @param priority {Integer} 消息的优先级
         * @returns {promise}
         */
        addQueueItemsToQueue(queueItems, key, priority = 1) {
            let defer = Promise.defer();

            core.q.getQueue(`crawler.urls.${key}`, {}).then((result) => {
                _.each(queueItems, (queueItem) => {
                    result.ch.publish("amq.topic", `${result.q.queue}.urls`, new Buffer(JSON.stringify(queueItem)), {
                        priority: priority
                    });
                });
                result.ch.close();
                defer.resolve(true);
            }, defer.resolve);

            return defer.promise;
        }

        /**
         * 添加下载完成的页面到Queue
         * @param queueItem {Object} queueItem数据
         * @param responseBody {string} 页面的html部分
         * @param key          {string} key
         * @returns {Promise}
         */
        addCompleteQueueItemsToQueue(queueItem, responseBody, key) {
            let defer = Promise.defer();

            queueItem = _.extend({}, queueItem, {
                responseBody: responseBody
            });
            core.q.getQueue(`crawler.deals.${key}`, {}).then((result) => {
                result.ch.publish("amq.topic", `${result.q.queue}.bodys`, new Buffer(JSON.stringify(queueItem)), {persistent: true});
                result.ch.close();
                defer.resolve(true);
            }, (err) => {
                console.log(err);
                defer.resolve();
            });

            return defer.promise;
        }

        /**
         * 数据分析完毕后存入到es中
         * @param queueItem {Object}
         * @param data      {Object}
         * @param type      {String}
         * @param index     {String}
         */
        addCompleteData(queueItem, data, type, index, keyField = "urlId") {
            if (!data[keyField] && keyField !== "randow") {
                keyField = "urlId";
            }

            return this.indexEsData(_.extend({
                url: queueItem.url,
                urlId: queueItem.urlId,
                createdAt: Date.now(),
                updatedAt: Date.now()
            }, data), keyField, type, index);
        }

        /**
         * 将数据回滚到待下载状态
         */
        rollbackCompleteData(queueItem, key) {
            let defer = Promise.defer();
            let saveQueueItem = _.extend(queueItem);

            saveQueueItem.responseBody = "";
            core.elastic.bulk({
                body: [

                    {delete: {_index: this.esIndex, _type: this.esTypeUrls, _id: queueItem.urlId}},
                    {index: {_index: this.esIndex, _type: this.esTypeQueueUrls, _id: queueItem.urlId}},
                    saveQueueItem
                ]
            }).then(()=> {
                this.addQueueItemsToQueue(queueItem, key, 2).then(defer.resolve, defer.reject);
            }).catch(defer.reject);
            // core.elastic.update({
            //     index: this.esIndex,
            //     type: this.esTypeUrls,
            //     id: queueItem.urlId,
            //     body: {
            //         doc: {
            //             fetched: false,
            //             updatedAt: Date.now()
            //         }
            //     }
            // }).then(() => {
            //     queueItem.responseBody = "";
            //     queueItem.fetched = false;
            //     queueItem.createdAt = null;
            //     queueItem.updatedAt = null;
            //     queueItem.stateData = null;
            //     this.addQueueItemsToQueue(queueItem, key, 2).then(defer.resolve, defer.reject);
            // }).catch(defer.reject);

            return defer.promise;
        }

        /**
         * 返回es中,数据的总数
         * @returns {Promise}
         */
        getCount(key) {
            let promises = [];

            promises.push(core.elastic.count({
                index: this.esIndex,
                type: this.esTypeRsbody
            }));
            promises.push(core.elastic.count({
                index: this.esIndex,
                type: this.esTypeQueueUrls
            }));
            promises.push(core.q.getQueue(`crawler.urls.${key}`));

            return Promise.all(promises);
        }
    }

    return QueueStoreOfES;
};