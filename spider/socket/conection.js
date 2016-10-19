/**
 * Created by NICK on 16/9/17.
 */

const _ = require("lodash");

module.exports = exports = (app, core, sockets) => {
    let ipInfo = app.spider.utils.ipinfo;

    _.each(sockets, (s)=> {
        s.on('connect', function () {
            s.emit("crawler:join", {
                pid: process.pid,
                hostname: ipInfo["hostname"],
                uptime: process.uptime(),
                chip: !!process.env.NODE_CHIP,
                ip: ipInfo.ips["IPv4"] || ipInfo.ips["IPv6"],
                downloader: core.downloadInstance || {},
                now: Date.now(),
            });
        });
        s.on('disconnect', function () {
            console.log("disconnected!!");
        });
    });
};