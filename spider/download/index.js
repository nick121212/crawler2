module.exports = (app, core) => {

    class Downloader {
        start(key, uri, settings) {
            let instance = app.spider.download[key];
            let promise = instance.start(uri, settings);

            promise.then((result) => {
                if (result.res && result.res.status == 302 && result.res.redirectURL) {
                    return instance.start(result.res.redirectURL, settings);
                }
                return result;
            });

            return promise;
        }
    }

    return new Downloader();
};