/**
 * Created by NICK on 16/8/10.
 */

const core = require('./core');
const consign = require("consign");
const fs = require("fs");
const path = require("path");
const app = {};

consign({verbose: false})
    .include("spider/utils")
    .include("spider/func")
    .include("spider/deal/data")
    .include("spider/deal/html")
    .include("spider/deal/deal")
    .include("spider/download")
    .include("spider/main")
    .include("spider")
    .into(app, core);

console.log(`pid:${process.pid};ENV:${process.env.ENV}`);

//递归创建目录 异步方法
function mkdirs(dirname, mode, callback){
    fs.exists(dirname, function (exists){
        if(exists){
            callback();
        }else{
            console.log(path.dirname(dirname));
            mkdirs(path.dirname(dirname), mode, function (){
                fs.mkdir(dirname, mode, callback);
            });
        }
    });
}
//递归创建目录 同步方法
function mkdirsSync(dirname, mode){
    console.log(dirname);
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname), mode)){
            fs.mkdirSync(dirname, mode);
            return true;
        }
    }
}

mkdirsSync('~/srv/anjuke/images', null, function (err) {
    "use strict";
    console.log(err);
});