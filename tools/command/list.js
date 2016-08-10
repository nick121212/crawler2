/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program)=> {
    let action = (options)=> {
        console.log("action list...");
        core.func.list(options).then(process.exit, process.exit);
    };

    program
        .command('list')
        .option('-i, --interval <n>', '等待时间', parseInt)
        .option('-p, --pid <n>', '已经启动的爬虫pid', parseInt)
        .option('-h, --hostname <s>', '已经启动的爬虫所在的服务器名')
        .description('显示爬虫列表')
        .action(action);
};