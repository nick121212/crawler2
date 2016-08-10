/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (hostname, options) => {
        core.func.create(hostname, options).then(process.exit, process.exit);
    };

    program
        .command('create <hostname>')
        // .option('-i, --interval <n>', '等待时间')
        // .option('-a, --address <s>', '需要新建的服务器IP地址')
        // .option('-h, --hostname <s>', '需要新建的服务器名称')
        .option('-t, --type <s>', '管理的工具，可选[forever],[pm2]，默认为node自身')
        .description('新建一个爬虫程序进程')
        .action(action);
};