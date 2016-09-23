module.exports = (app, core)=> {

    class Downloader {
        start(key, uri, settings) {
            let instance = app.spider.download[key];
            let promise = instance.start(uri, settings);

            return promise.then((result)=> {
                if (result.res && result.res.status == 302 && result.res.redirectURL) {
                    return instance.start(result.res.redirectURL, settings);
                }
                return result;
            }, err => {
                // if (err && err.status == 302 && err.redirectUrl) {
                //     return instance.start(err.redirectUrl, settings);
                // }
                return err;
            });

            // return promise;
        }
    }

    return new Downloader();
};