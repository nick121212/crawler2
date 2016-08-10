module.exports = (app, core)=> {

    class Downloader {
        start(key, uri, settings) {
            let instance = app.spider.download[key];
            let promise = instance.start(uri, settings);

            promise.catch(err => {
                return err;
            });

            return promise;
        }
    }

    return new Downloader();
};