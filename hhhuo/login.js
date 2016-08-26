/**
 * Created by NICK on 16/8/22.
 */

const request = require("superagent");

module.exports = ()=> {
    "use strict";
    let req = request.post("http://res.hhhuo.net/Login.aspx");
    let defer = Promise.defer();

    req
        .set("User-Agent", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)")
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .withCredentials()
        .send({
            QquerType: "Login",
            pwd: 888888,
            name: "hxmcl",
            Resolution: "1366*768",
            Browser: "Microsoft+Internet+Explorer%2C%E7%89%88%E6%9C%AC%E5%8F%B7%3A9.0",
            hdLoginType: true
        })
        .end((err, res) => {
            if (err) {
                return defer.reject(err);
            }

            // console.log(res.headers["set-cookie"]);

            if (!res.headers["set-cookie"] || !res.headers["set-cookie"].length) {
                return defer.reject(new Error("没有cookie的信息"));
            }

            try {
                let result = JSON.parse(res.text);
                let cookieId = res.headers["set-cookie"][0].split(";");

                console.log(result);

                if (result.state !== 1) {
                    return defer.reject(new Error(result.Error));
                }

                if (cookieId.length == 0) {
                    return defer.reject(new Error("没有cookie的信息"));
                }

                defer.resolve(cookieId[0]);

            } catch (e) {
                return defer.reject(e);
            }

        });

    return defer.promise;
};

