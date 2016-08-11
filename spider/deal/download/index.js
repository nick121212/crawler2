/**
 * Created by NICK on 16/8/10.
 */

const request = require("request");

module.exports = (app, core)=> {
    "use strict";

    let downloadImg = (uri, filename)=> {
        let defer = Promise.defer();

        request.head(uri, function (err, res, body) {
            if (err) {
                console.log('err: ' + err);
                return defer.reject(err);
            }
            request(uri).pipe(fs.createWriteStream('images/' + filename)).on('close', callback);  //调用request的管道来下载到 images文件夹下
        });

        return defer.promise;
    };
};