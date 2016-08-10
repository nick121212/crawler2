/**
 * Created by NICK on 16/7/4.
 */

module.exports = exports = (app, core) => {
    return {
        replaceRegexp: (str) => {
            str = str || "";
            str = str.toString();

            return str.replace(/(^\/)|(\/$)/g, "");
        }
    };
};