/**
 * Created by NICK on 16/7/1.
 */
let schedule = require("node-schedule");
let shell = require('shelljs');

module.exports = exports = (core) => {
    let commands = {
        poff: "poff nicv",
        pptpsetup: "pptpsetup --create nicv --server czpptp.webok.net --user cz003 --password 111 --start",
        routeAdd: "route add default gw ",
        nginxRestart: "service nginx restart",
        nginxStop: "service nginx stop",
        nginxStart: "service nginx start",
        route: "route",
        routeDelete: "route delete default gw all"
    };
    let isRunning = false,
        lastIp,
        retryCount = 0;

    let scheduleJob1 = () => {
        // 5s后重启nginx
        setTimeout(()=> {
            "use strict";
            shell.exec(commands.nginxRestart, {silent: false});
            retryCount = 0;
            isRunning = false;
        }, 5000);
    };
    let success = ()=> {
        setTimeout(()=> {
            "use strict";
            shell.exec(commands.routeAdd + lastIp, {silent: false});
            let route = shell.exec(commands.route, {silent: false}).stdout;

            if (route.indexOf(lastIp) > 0) {
                scheduleJob1();
            } else {
                if (retryCount > 5) {
                    return shell.exit(1);
                }
                setTimeout(function () {
                    isRunning = false;
                    scheduleJob();
                }, 10);
            }
        }, 1000);
    };
    let scheduleJob = () => {
        let isSuccess, localhostIp, pptpsetup, datas = [];

        if (isRunning) return;

        isRunning = true;
        console.log(new Date());
        // 关闭nginx
        shell.exec(commands.nginxStop, {silent: false});
        // 关闭poff
        shell.exec(commands.poff, {silent: false});
        // 次数+1
        retryCount++;
        // 登陆vpn
        pptpsetup = shell.exec(commands.pptpsetup, {silent: true, async: true});
        pptpsetup.stdout.on("data", (data) => {
            datas.push(data);
            if (/remote/i.test(datas.join(""))) {
                console.log("pptp done");
                isSuccess = /succeeded/i.test(datas.join(""));
                isSuccess && (localhostIp = datas.join("").match(/\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}/ig));

                console.log(datas.join(""));
                console.log(localhostIp);

                if (isSuccess && localhostIp.length > 1) {
                    lastIp = localhostIp[0];
                    console.log(lastIp);
                    return success();
                }
            }
        });
    };
    return (options) => {
        schedule.scheduleJob(`*/${options.interval || 1} * * * *`, scheduleJob);
        scheduleJob();
    };
};