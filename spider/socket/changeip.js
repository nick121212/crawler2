/**
 * Created by NICK on 16/7/1.
 */
let shell = require("shelljs");
let _ = require("lodash");
let isRunning = false,
    lastIp,
    retryCount = 0;


module.exports = exports = (app, core, sockets) => {
    let commands = {
        poff: "poff nicv",
        pon: "pon nicv",
        pptpsetup: `pptpsetup --create nicv --server czpptp.webok.net --user ${process.env.NODE_USER || "cz003"} --password ${process.env.NODE_PWD || "111"} --start`,
        routeAdd: "route add default gw ",
        nginxRestart: "service nginx restart",
        nginxStop: "service nginx stop",
        nginxStart: "service nginx start",
        route: "route",
        routeDelete: "route delete default gw all"
    };
    let ipInfo = app.spider.utils.ipinfo;

    let scheduleJob1 = () => {
        // 5s后重启nginx
        setTimeout(() => {
            // shell.exec(commands.pon, {silent: false});
            shell.exec(commands.nginxRestart, { silent: false });
            retryCount = 0;
            isRunning = false;
        }, 5000);
    };
    let success = () => {
        setTimeout(() => {
            "use strict";
            shell.exec(commands.routeAdd + lastIp, { silent: false });
            let route = shell.exec(commands.route, { silent: false }).stdout;

            console.log("success----------", lastIp, route);
            if (route.indexOf(lastIp) > 0) {
                scheduleJob1();
            }
        }, 1000);
    };
    let scheduleJob = () => {
        let isSuccess, localhostIp, pptpsetup, datas = [];

        if (isRunning) return;

        lastIp = "";
        retryCount = 0;
        isRunning = true;
        // 关闭nginx
        shell.exec(commands.nginxStop, { silent: false });
        // 关闭poff
        shell.exec(commands.poff, { silent: false });
        // 次数+1
        retryCount++;
        // 登陆vpn
        pptpsetup = shell.exec(commands.pptpsetup, { silent: true, async: true });
        pptpsetup.stdout.on("data", (data) => {
            datas.push(data);
            if (/remote/i.test(datas.join(""))) {
                isSuccess = /succeeded/i.test(datas.join(""));
                isSuccess && (localhostIp = datas.join("").match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/ig));

                if (isSuccess && localhostIp.length > 1) {
                    lastIp = localhostIp[0];
                    return success();
                }
            }
        });
    };
    let changeIp = (params, cb) => {
        "use strict";
        console.log("-------", ipInfo.hostname, params.ipInfo.hostname);
        if (ipInfo.hostname == params.ipInfo.hostname) {
            scheduleJob();
            cb && cb({ ret: 0 });
        }
    };

    if (process.env.NODE_CHIP) {
        scheduleJob();
        _.each(sockets, (s) => {
            s.on('crawler:chip', (params, cb) => {
                changeIp(params, cb);
            });
        });
    }
};