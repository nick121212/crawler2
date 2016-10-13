/**
 * Created by NICK on 16/8/10.
 */

const io = require('socket.io-client');
const core = require('./core');
const consign = require("consign");
const app = {};
const socket = io(`http://${core.config.socket.host}:${core.config.socket.port}/crawler`);

consign({verbose: false})
    .include("spider/utils")
    // .include("spider/func")
    .include("spider/socket")
    .include("spider/deal/data")
    .include("spider/deal/html")
    .include("spider/deal/deal")
    .include("spider/download")
    .include("spider/main")
    .include("spider")
    .into(app, core, socket);

console.log(`pid:${process.pid};ENV:${process.env.ENV}`);