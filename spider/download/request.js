/**
 * Created by NICK on 16/8/10.
 */

const fs = require("fs");
const path = require("path");
const URI = require("urijs");
const md5 = require("blueimp-md5");
const request = require("superagent");
const requestProxy = require("superagent-proxy")(request);

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

class Download {
    start(uri, settings = {}, ipInfo = {}) {
        let defer = Promise.defer();

        try {
            let urlId = md5(uri.toString());
            let stream = null;
            let req;

            console.log(settings.images);

            settings.images = settings.images || "/data/images";
            mkdirsSync(settings.images, null);
            if (fs.existsSync(`${settings.images}${urlId}`)) {
                defer.resolve();
            } else {
                stream = fs.createWriteStream(`${__dirname}/../../images/${urlId}`);
                uri = URI(uri.toString());
                uri = uri.toString().replace(/\d+x\d+\D\.(?:jpg|png)/, "10000x10000m." + uri.suffix());

                req = request.get(uri.toString());
                if (settings.useProxy && settings.ipInfo && settings.ipInfo.port && settings.ipInfo.port) {
                    req.proxy(`http://${settings.ipInfo.host}:${settings.ipInfo.port}`);
                }
                req.on('response', function (res) {
                    console.log(res.status);
                });
                req.on('error', function (err) {
                    defer.reject(err);
                });
                stream.on('finish', function () {
                    console.log(`fetch picture complete ${uri.toString()} at ${new Date()}`);
                    defer.resolve();
                });
                req.pipe(stream);
            }
        } catch (err) {
            defer.reject(err);
        }

        return defer.promise;
    }
}

module.exports = ()=> {
    return new Download();
};