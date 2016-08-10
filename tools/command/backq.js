/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (key, type, queue, router, options) => {
        core.func.backq(key, type, queue, router, options).then(process.exit, process.exit);
    };

    program
        .command('backq <key> <type> <queue> <router>')
        .option('-i, --interval <n>', '等待时间')
        .option('-f, --from <n>', '从哪儿开始')
        .option('-s, --size <n>', 'size')
        .description('回滚queue')
        .action(action);
};