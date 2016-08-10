let jpp = require('json-path-processor');

module.exports = exports = () => {
    class ConfigBuilder {
        /**
         * 配置文件生成类
         * @param key             {String}      唯一字符串
         * @param host            {String}      域名
         * @param domainWhiteList {Array}       域名白名单
         * @param blackPathList   {Array}       路径黑名单
         * @param whitePathList   {Array}       路径白名单
         * @param pages           {Object}      需要分析的页面配置
         */
        constructor(key, host, domainWhiteList = [], blackPathList = [], whitePathList = [], pages = {}) {
            this.key = key;
            this.host = host;
            this.domainWhiteList = domainWhiteList;
            this.blackPathList = blackPathList;
            this.whitePathList = whitePathList;
            this.pages = pages;
            this.setBaseInfo();

            this.test = true;
        }

        /**
         * 设置基础信息
         * @param interval   {Number}   下载间隔
         * @param downloader {String}   下载器
         */
        setBaseInfo(interval = 500, downloader = "superagent") {
            this.interval = interval || 500;
            this.downloader = downloader || "superagent";
        }

        /**
         * 添加域名白名单成员
         * @param domain {String} 域名
         */
        addDomainWhite(domain) {
            this.domainWhiteList.push(domain);
        }

        /**
         * 添加路径黑名单
         * @param regexp
         * @param scope
         */
        addBlackPath(regexp, scope = "i") {
            this.blackPathList.push({
                regexp: regexp.toString(),
                scope: scope
            });
        }

        /**
         * 添加路径白名单
         * @param regexp
         * @param scope
         */
        addWhitePath(regexp, scope = "i") {
            this.whitePathList.push({
                regexp: regexp.toString(),
                scope: scope
            });
        }

        /**
         * 添加一个需要分析页面配置
         * @param key    {String}   主键
         * @param rule   {Object}   分析页面的正则匹配规则
         * @param index  {String}   存储es时候的index值
         * @param fieldKey {String} 存储es时候的type值
         */
        addPage(key, rule, index = "", fieldKey = "url") {
            if (this.pages[key]) {
                return;
            }

            if (rule && rule.regexp) {
                rule.regexp = rule.regexp.replace(/(^\/)|(\/$)/g, "");
            }

            this.pages[key] = {
                key: index || key,
                rule: rule,
                fieldKey: fieldKey,
                test: false,
                data: {}
            };
        }

        addPageData(pageKey, fieldPath, selector = [], methodInfo = null, dataStrategy = "string", dataLaraParams = [], dealStrategy = "cheerio") {
            let result = jpp(this.pages).get(pageKey).get('data');

            result.set(fieldPath, {
                fieldPath: fieldPath,
                selector: selector,
                methodInfo: methodInfo,
                dataStrategy: dataStrategy,
                dataLaraParams: dataLaraParams,
                dealStrategy: dealStrategy,
                data: {}
            }, true);
        }

        /**
         * 生成字符串
         */
        toString() {
            return JSON.stringify(this);
        }
    }

    return ConfigBuilder;
};