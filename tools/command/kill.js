/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (pid, options) => {
        console.log("action kill...");
        core.func.kill(pid, options).then(process.exit, process.exit);
    };

    program
        .command('kill <pid>')
        .option('-t, --type <s>', '管理的工具，可选[forever],[pm2]，默认为node自身')
        .description('结束一个爬虫程序。pid=all结束所有的爬虫')
        .action(action);
};