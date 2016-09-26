/**
 * Created by NICK on 16/7/1.
 */

const _ = require("lodash");
const fs = require("fs");

module.exports = exports = (core, program) => {
    let action = (configKey, options) => {
        let config = core.config[configKey];
        console.log("action start...");
        if (!config || !config.index) {
            console.error("没有找到配置数据");
            return process.exit(1);
        }

        _.forEach(config.index.pages, (page, key)=> {
            "use strict";
            fs.writeFileSync("file/" + key + '.json', JSON.stringify(page));
        });

        // core.func.start(config.index, options).then(process.exit, process.exit);
    };

    program
        .command('start')
        .arguments('<config-key>', '配置的key。[anjuke,fangduoduo,fangtianxia,lianjia,soufang,zhongyuan]')
        .option('-i, --interval <n>', '等待时间', parseInt)
        .option('-p, --pid <n>', '已经启动的爬虫pid', parseInt)
        .option('-h, --hostname <s>', '已经启动的爬虫所在的服务器名')
        .description('开始一个爬虫程序。start lianjia ')
        .action(action);
};