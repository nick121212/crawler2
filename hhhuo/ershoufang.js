const request = require("superagent");

module.exports = (cookie, page, rows = 100) => {
    let defer = Promise.defer();
    let req1 = request.post("http://res.hhhuo.net/Hand/SelectQueryList.ashx");

    req1.set("User-Agent", "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/7.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)")
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded; charset-UTF-8')
        .set("Cookie", cookie)
        .withCredentials()
        .send({
            Action: "V_CD_BargainOn",
            QueryString: "1=1 AND [SigningDate] >= '2016-01-01' AND [SigningDate] <= '2016-07-31' and HouseType in ('办公楼','别墅洋房','工厂','公寓','里弄房','其它','商铺','未知','新工房')",
            page: page,
            rows: rows,
            sort: "BargainOnGuid",
            order: "ASC"
        })
        .end((err, res) => {
            console.log(err);
            if (err) {
                defer.reject(err);
            }

            try {
                let results = JSON.parse(res.text);
                defer.resolve(results);
            } catch (e) {
                defer.reject(e);
            }
        });

    return defer.promise;
};