"use strict";

const _ = require("lodash");
const md5 = require("blueimp-md5");

module.exports = (app, core) => {
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
            this.esIndexAllIn = "crawler-allin";
        }

        /**
         * 获取一个数据的详细信息
         * @param queueItem
         * @returns {*}
         */
        getRsBody(queueItem) {
            return core.elastic.get({
                index: this.esIndex,
                type: this.esTypeRsbody,
                id: queueItem.urlId
            });
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
         * @param query {string} queryString
         * @returns {queueItem}
         */
        getQueueItemInfo(protocol, host, port, path, depth, query) {
            let url, queueItem;

            if (isNaN(port) || !port) {
                port = 80;
            }
            depth = depth || 1;
            protocol = protocol === "https" ? "https" : "http";
            url = protocol + "://" + host + (port !== 80 ? ":" + port : "") + path + (query ? ("?" + query) : "");
            url = decodeURIComponent(url);
            queueItem = {
                url: url,
                urlId: md5(url),
                protocol: protocol,
                host: host,
                port: port,
                path: path,
                depth: depth,
                query: query,
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
                // consistency: "one"
            };

            if (idField !== "randow") {
                config.id = data[idField];
            }

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
        addUrlsToEsUrls(urls, key, keyAlias) {
            let queueItems = {};
            let defer = Promise.defer();
            let esMgetBody = [];

            // 检查url在es中是否存在
            _.each(urls, (url) => {
                let queueItem = this.getQueueItemInfo(url.protocol, url.host, url.port, url.path, url.depth, url.query);
                queueItems[queueItem.urlId] = queueItem;
                queueItem.needFetch = true;
                // 赋值KEY
                url.rule && (queueItem.type = url.rule.key);
                // 是否需要下载
                url.rule && (queueItem.needFetch = url.rule.needFetch);
                // 是否需要保存链接到总库
                url.rule && (queueItem.needSaveToAllIn = url.rule.needSaveToAllIn);
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
                esMgetBody.push({
                    _index: this.esIndexAllIn,
                    _type: keyAlias || key,
                    _id: queueItem.urlId,
                    fields: ["createdAt"]
                });
            });

            // 处理数据,先判断queueUrl中是否存在,存在则不添加到queue
            // 判断urls中是否存在,如果存在,则判断数据是否已经fetched,如果没有则加到queue里
            core.elastic.mget({
                body: {
                    docs: esMgetBody
                }
            }).then((results) => {
                let urlRes, queueUrlRes, allInUrlRes, esBulkBody = [];

                for (let i = 0, n = results.docs.length; i < n; i += 3) {
                    urlRes = results.docs[i]; // url中type的数据
                    queueUrlRes = results.docs[i + 1]; // queueUrl中的type的数据
                    allInUrlRes = results.docs[i + 2]; // allIn中的数据

                    // queue数据库中是否存在
                    if (queueUrlRes.found) { // && queueUrlRes.fields["fetched"].length && !queueUrlRes.fields["fetched"][0]) {
                        continue;
                    }
                    // url数据库中是否存在,判断fetched
                    if (urlRes.found && urlRes.fields["fetched"].length && urlRes.fields["fetched"][0]) {
                        continue;
                    }
                    // 存储需要新建到queue里的数据数组，判断是否需要入到queue
                    if (queueItems[urlRes._id]) {
                        if (queueItems[urlRes._id].needFetch === true) {
                            esBulkBody.push({
                                create: {
                                    _index: this.esIndex,
                                    _type: this.esTypeQueueUrls,
                                    _id: urlRes._id
                                }
                            });
                            esBulkBody.push(queueItems[urlRes._id]);
                        }
                        // 数据添加到总库中,先判断是否已经存在，如果已经存在，则更新updatedAt，否则新建数据
                        if (queueItems[urlRes._id].needSaveToAllIn === true) {
                            if (allInUrlRes.found) {
                                esBulkBody.push({
                                    update: {
                                        _index: this.esIndexAllIn,
                                        _type: keyAlias || key,
                                        _id: urlRes._id
                                    }
                                });
                                esBulkBody.push({
                                    doc: {
                                        updatedAt: Date.now()
                                    }
                                });
                            } else {
                                let now = Date.now();
                                esBulkBody.push({
                                    create: {
                                        _index: this.esIndexAllIn,
                                        _type: keyAlias || key,
                                        _id: urlRes._id
                                    }
                                });
                                esBulkBody.push({
                                    url: queueItems[urlRes._id].url,
                                    createdAt: now
                                });
                            }
                        }
                    }
                }

                return esBulkBody;
            }).then((esBulkBody) => {
                if (!esBulkBody.length) {
                    return defer.resolve();
                }
                // 新建数据,并添加到queue
                return core.elastic.bulk({
                    body: esBulkBody
                });
            }).then((response) => {
                let newQueueItems = [];

                // 判断成功的数据，添加到queue中
                _.each(response.items, (createResult) => {
                    createResult = createResult.create;
                    // 如果创建成功，则加入到queue中等待下载
                    if (createResult && createResult._type === this.esTypeQueueUrls && (createResult.status === 201) && queueItems[createResult._id]) {
                        if (!_.filter(newQueueItems, (item) => {
                                return item.urlId == createResult._id;
                            }).length) {
                            newQueueItems.push(queueItems[createResult._id]);
                        }
                    }
                });
                if (newQueueItems.length) {
                    return this.addQueueItemsToQueue(newQueueItems, key);
                }
            }).then(() => {
                defer.resolve();
            }).catch(defer.reject);

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

            // 建立请求队列
            core.q.getQueue(`crawler.urls.${key}`, {}).then((result) => {
                Promise.all([
                    // 绑定queue到exchange
                    result.ch.bindQueue(result.q.queue, "amq.topic", `${result.q.queue}.urls`),
                    // 每次消费1条queue
                    result.ch.prefetch(1)
                ]).then(() => {
                    _.each(queueItems, (queueItem) => {
                        result.ch.publish("amq.topic", `${result.q.queue}.urls`, new Buffer(JSON.stringify(queueItem)), {
                            priority: priority,
                            persistent: true
                        });
                    });
                    result.ch.close();
                    defer.resolve(true);
                });
            }, defer.reject);

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
                result.ch.publish("amq.topic", `${result.q.queue}.bodys`, new Buffer(JSON.stringify(queueItem)), {
                    persistent: true
                });
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
         * 添加多个数据到es，并进行数据的脏值检测
         * @param results
         * @param type
         * @param index
         * @param keyField
         * @returns {Promise}
         */
        addMutipleCompleteData(results, key, aliasKey, index, keyField = "urlId") {
            const defer = Promise.defer();
            let esMgetBody = [];
            let queueItemsNew = {};
            let notFoundQueueItems = [];

            _.each(results, (result) => {
                let queueItem = this.getQueueItemInfo(result.protocol, result.host, result.port, result.path, result.depth, result.query);

                queueItemsNew[queueItem[keyField]] = result;
                esMgetBody.push({
                    _index: index,
                    _type: aliasKey,
                    _id: queueItem[keyField]
                });
            });

            if (esMgetBody.length) {
                core.elastic.mget({
                    body: {
                        docs: esMgetBody
                    }
                }).then((getRes) => {
                    let updateDocs = [];

                    _.each(getRes.docs, (doc) => {
                        let res = doc._source || {};
                        let cur = queueItemsNew[doc._id];

                        if (!doc.found) {
                            notFoundQueueItems.push(queueItemsNew[doc._id]);
                        } else {
                            // 如果字段有更新，更新数据，更新总的数据表
                            if (_.reduce(_.keys(cur), (key, equal) => {
                                    return equal && res[key] == cur[key];
                                }, true)) {
                                updateDocs.push({
                                    update: {
                                        _index: index,
                                        _type: aliasKey,
                                        _id: doc._id
                                    }
                                });
                                updateDocs.push({
                                    doc: _.extend({
                                        updatedAt: Date.now()
                                    }, queueItemsNew[doc._id].res || {})
                                });
                            }
                        }
                    });

                    this.addUrlsToEsUrls(notFoundQueueItems, key, aliasKey);

                    // this.addQueueItemsToQueue(notFoundqueueItems, key);

                    return updateDocs;
                }).then((updateDocs) => {
                    if (!updateDocs || !updateDocs.length) {
                        return;
                    }

                    return core.elastic.bulk({body: updateDocs});
                }).then(defer.resolve, defer.reject);
            } else {
                defer.resolve();
            }

            return defer.promise;
        }

        /**
         * 将数据回滚到待下载状态
         * @param queueItem {Object}
         * @param key {String}
         * @return {Promise}
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
            }).then(() => {
                this.addQueueItemsToQueue([queueItem], key, 2).then(defer.resolve, defer.reject);
            }).catch(defer.reject);

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