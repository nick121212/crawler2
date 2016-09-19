/**
 * Created by NICK on 16/9/17.
 */

module.exports = exports = (app, core, socket) => {
    let ipInfo = app.spider.utils.ipinfo;

    socket.on('connect', function () {
        console.log("connect");
        socket.emit("crawler:join", {
            pid: process.pid,
            hostname: ipInfo["hostname"],
            uptime: process.uptime(),
            ip: ipInfo.ips["IPv4"] || ipInfo.ips["IPv6"],
            downloader: core.downloadInstance || {},
            now: Date.now(),
        });
    });
    socket.on('disconnect', function () {
        console.log("disconnected!!");
    });
};