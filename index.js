/**
 * Created by NICK on 16/8/10.
 */

const _ = require("lodash");
const io = require('socket.io-client');
const core = require('./core');
const consign = require("consign");
const app = {};
// const socket = io(`http://${core.config.socket.host}:${core.config.socket.port}/crawler`);
// const socketMain = io(`http://${core.config.socketChip.host}:${core.config.socketChip.port}/crawler`);
const sockets = [];

// global.Promise = require("bluebird");
// console.log(Promise.defer());

_.each(core.config.hosts, (host) => {
    sockets.push(io(`http://${host}/crawler`));
});


consign({ verbose: false })
    .include("spider/utils")
    // .include("spider/func")
    .include("spider/socket")
    .include("spider/deal/data")
    .include("spider/deal/html")
    .include("spider/deal/deal")
    .include("spider/download")
    .include("spider/main")
    .include("spider")
    .into(app, core, sockets);

console.log(`pid:${process.pid};ENV:${process.env.ENV}`);


process.on('unhandledRejection', (reason, p) => {
    console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging, throwing an error, or other logic here
});