/**
 * Created by NICK on 16/7/1.
 */

module.exports = exports = (core, program) => {
    let action = (options) => {
        core.func.chips(options);
    };

    program
        .command('chips')
        .option('-i, --interval <n>', '等待时间')
        .description('动态更换ip')
        .action(action);
};