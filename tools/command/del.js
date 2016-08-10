/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (key, options) => {
        core.func.del(key, options).then(process.exit, process.exit);
    };

    program
        .command('del <key>')
        .description('删除一个网站数据')
        .action(action);
};