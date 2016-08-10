/**
 * Created by NICK on 16/7/1.
 */
let fs = require("fs");
let _ = require("lodash");

module.exports = exports = (core) => {
    let total = 0, setHeader = false;

    let search = (index, type = "all", filename = `${Date.now()}.csv`, fields = "", key = "", from = 0, size = 20) => {
        let defer = Promise.defer();

        fields = fields.split(",");
        core.elastic.search({
            index: index,
            type: type === "all" ? null : type,
            scroll: '10s',
            search_type: 'scan',
            from: from,
            size: size
        }, function getMoreUntilDone(error, response) {

            if (error) {
                console.log(error);
                return defer.reject(error);
            }

            response.hits.hits.forEach(function (res) {
                let strs = [], header = [];

                strs.push(res._type);
                res = res._source;
                header.push("_type");

                if (key && !res[key]) {
                    return;
                }

                _.each(fields, (field)=> {
                    if (!setHeader) {
                        header.push(field);
                    }
                    if (_.isArray(res[field]) || _.isObject(res[field])) {
                        strs.push(JSON.stringify(res[field]));
                    } else {
                        strs.push(res[field] || "无");
                    }
                });
                if (!setHeader && header.length) {
                    setHeader = true;
                    fs.appendFileSync(filename, `${header.join("\t")}\n`);
                }
                fs.appendFileSync(filename, `${strs.join("\t")}\n`);
            });
            total += response.hits.hits.length;
            console.log("scroll to:", total);
            if (response.hits.total !== total) {
                core.elastic.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                console.log("导出总数：", total);
                console.log("文件:", filename);
                defer.resolve();
            }
        });

        return defer.promise;
    };

    return (index, type, filename, fields, key) => {

        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
        }
        fs.writeFileSync(filename, "");

        return search(index, type, filename, fields, key, 0, 1000);
    };
};