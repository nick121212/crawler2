/**
 * Created by NICK on 16/8/2.
 */

module.exports = exports = (core)=> {
    "use strict";

    let rtn = (t)=> {
        let defer = Promise.defer();
        let total = 0;
        let results = [];

        core.elastic.search({
            index: "crawler.loupan",
            // type: null,
            scroll: '30s',
            search_type: 'scan',
            from: 0,
            size: 100
        }, function getMoreUntilDone(error, response) {

            if (error) {
                console.log(error);
                return defer.reject(error);
            }

            response.hits.hits.forEach(function (res) {
                res = res._source;
                let area = res.area.replace(/楼盘/g, "");
                let price = res.price.match(/\d+/i);

                console.log(res.price);

                if (area === "浦东") {
                    area += "新区";
                } else if (area === "崇明") {
                    area += "县";
                } else {
                    area += "区";
                }

                results.push({
                    tags: res.tags ? res.tags.join(',') : "",
                    province: res.province.replace(/安居客/g, ""),
                    city: res.city.replace(/楼盘/g, "") + "市",
                    area: area,
                    introduction: res.introduction,
                    name: res.name,
                    averagePrice: price && price.length ? price[0] : 0,
                    source: "anjuke",
                    averagePriceUnit: res.averagePriceUnit,
                    locationPlate: res.plate.replace(/楼盘/g, ""),
                    address: res.address,
                    developerName: res.developerName,
                    propertyCompany: res.propertyCompany,
                    propertyType: res.type,
                    propertyAge: res.propertyAge,
                    buildingType: res.buildingType,
                    startTime: res.startTime,
                    propertyFee: res.propertyFee,
                    areaAmount: res.areaAmount,
                    totalHouseholds: res.totalHouseholds,
                    buildingTime: res.buildingTime,
                    volumeRate: res.volumeRate,
                    partingAmount: res.partingAmount,
                    greeningRate: res.greeningRate,
                    floorInfo: res.floorInfo,
                    sellPhone: res.sellPhone,
                    sellAddress: res.sellAddress,
                    jobProgress: res.jobProgress,
                    decorationStandard: res.decorationStandard,
                    downPayment: res.downPayment,
                    monthPayment: res.monthPayment,
                });
            });

            total += response.hits.hits.length;
            console.log("scroll to:", total);
            if (response.hits.total !== total) {
                core.elastic.scroll({
                    scrollId: response._scroll_id,
                    scroll: '30s'
                }, getMoreUntilDone);
            } else {
                core.db.models.loupan.bulkCreate(results,
                    {ignoreDuplicates: true}).then(function (loupans) {
                    console.log("done");
                    defer.resolve();
                }, defer.reject);
            }
        });

        return defer.promise;
    };

    return ()=> {
        return Promise.all([
            core.db.models.loupan.destroy({
                where: {}
            }),
            core.db.sequelize.transaction().then((t) => {
                return rtn(t).then(() => {
                    return t.commit().then(console.log, console.error);
                }, (err) => {
                    return t.rollback().then(()=>console.error(err), console.error);
                });
            }, console.error)
        ]);
    };
};
