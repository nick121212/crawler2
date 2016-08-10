/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (options) => {
        core.func.info(options).then(process.exit, process.exit);
    };

    program
        .command('info')
        .option('-i, --interval <n>', '等待时间')
        .option('-k, --key <s>', 'key', null, null)
        .description('获取当前爬虫的地址信息')
        .action(action);
};