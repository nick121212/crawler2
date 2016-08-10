/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (dialect, options) => {
        console.log(dialect);
        core.func["export"](dialect, options).then(process.exit, process.exit);
    };

    program
        .command('export <dialect>')
        .option('-f, --filename <s>', '导出文件名')
        .option('-i, --index <s>', '导出的索引')
        .option('-t, --type <s>', '导出的类型')
        .option('-F, --fields <s>', '导出的类型')
        .option('-k, --key <s>', '判断字段是否有数据,没有则丢弃数据')
        .description('从es导出数据')
        .action(action);
};