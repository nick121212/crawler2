/**
 * Created by NICK on 16/8/10.
 */

const core = require('./core');
const consign = require("consign");
const app = {};

consign({ verbose: false })
    .include("spider/utils")
    .include("spider/func")
    .include("spider/deal/data")
    .include("spider/deal/html")
    .include("spider/deal/deal")
    .include("spider/download")
    .include("spider/main")
    .include("spider")
    .into(app, core);

core.q.rpc.call("chips", {});
console.log(`pid:${process.pid};ENV:${process.env.ENV}`);