/**
 * Created by NICK on 16/7/1.
 */
module.exports = exports = (core) => {
    return (dialect, options) => {
        let defer = Promise.defer();

        if (dialect === "mysql") {
            if (core.func.exports.mysql[options.filename]) {
                core.func.exports.mysql[options.filename]();
            } else {
                defer.reject(new Error("没有找到导出文件!"));
            }
        } else {
            core.func.exports.excel.export(options.index, options.type, options.filename, options.fields, options.key).then(defer.resolve, defer.reject);
        }

        return defer.promise;
    };
};