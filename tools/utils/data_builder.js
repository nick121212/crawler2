let _ = require("lodash");

module.exports = () => {
    class Builder {

        constructor() {
            this.formats = {
                str: {
                    str: []
                },
                num: {
                    num: []
                },
                match: {
                    price: {match: {regexp: /\d+(?:.\d+|)/.toString(), index: 0}},
                }
            };
        }

        /**
         * 默认情况
         * @param key
         * @param selector
         * @param removeSelector
         * @param methodInfo
         * @param formats
         * @param htmlStrategy
         * @returns {{key: *, selector: Array, methodInfo: {text: Array}, formatStrategy: *[], htmlStrategy: string, dealStrategy: string, removeSelector: Array}}
         */
        normal(key, selector = [], removeSelector = [], methodInfo = {text: []}, formats = [{"str": []}], htmlStrategy = "jsdom") {
            return {
                key: key,
                selector: selector,
                removeSelector: removeSelector,
                methodInfo: methodInfo,
                formats: formats,
                htmlStrategy: htmlStrategy,
                dealStrategy: "normal"
            };
        }

        combine(result, ...settings) {
            _.each(settings, (setting) => {
                _.extend(result, setting);
            });

            return result;
        }

        /**
         * 对象的情况
         * @param key
         * @param data
         * @param htmlStrategy
         * @returns {{key: *, selector: Array, htmlStrategy: string, data: *, dealStrategy: string}}
         */
        object(key, data, htmlStrategy = "jsdom") {
            return {
                key: key,
                selector: [],
                htmlStrategy: htmlStrategy,
                data: data,
                dealStrategy: "object"
            };
        }

        /**
         * 有数组的情况
         * @param key
         * @param selector
         * @param removeSelector
         * @param data
         * @param htmlStrategy
         * @returns {{key: *, selector: *, dealStrategy: string, htmlStrategy: string, removeSelector: Array, data: Array}}
         */
        array(key, selector, removeSelector = [], data = [], htmlStrategy = "jsdom") {
            return {
                key: key,
                selector: selector,
                removeSelector: removeSelector,
                data: data,
                htmlStrategy: htmlStrategy,
                dealStrategy: "array"
            };
        }

        switchs(selector, removeSelector = [], data = [], htmlStrategy = "jsdom") {
            return {
                selector: selector,
                removeSelector: removeSelector,
                data: data,
                htmlStrategy: htmlStrategy,
                dealStrategy: "switch"
            };
        }

        cases(selector, removeSelector = [], match = "", data = [], methodInfo = {text: []}) {
            return {
                selector: selector,
                removeSelector: removeSelector,
                methodInfo: methodInfo,
                match: match,
                data: data,
                dealStrategy: "case"
            };
        }

        or(data = []) {
            return {
                selector: [],
                removeSelector: [],
                methodInfo: null,
                data: data,
                dealStrategy: "or"
            };
        }
    }

    return new Builder();
};