/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (options) => {
        console.log("watch start ", new Date());
        core.func.watch(options);//.then(process.exit, process.exit);
    };

    program
        .command('watch')
        .option('-i, --interval <n>', '等待时间', parseInt)
        .option('-k, --keys <s>', '检测哪些keys')
        .description('检测当前的爬虫状态,并根据链接数量,动态更新。')
        .action(action);
};