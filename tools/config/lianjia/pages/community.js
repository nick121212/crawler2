module.exports = (core) => {
    return (config) => {
        config.pages.community = {
            key: "crawler.community",
            rule: [{
                "regexp": /\/xiaoqu\/\d+.html/.toString(),
                scope: "i"
            }],
            fieldKey: "name",
            strict: true,
            strictField: "name",
            test: false,
            area: {
                none: {
                    data: [
                        // 小区名称
                        core.utils.data_builder.normal("name", [".detail-block .res-top .title .t h1"]),
                        // 小区地址
                        core.utils.data_builder.normal("address", [".adr"]),
                        //版块
                        core.utils.data_builder.normal("plate", [".detail-block .title .t span:eq(0)"])
                    ]
                },
                pictures: {
                    selector: ".album-box .smart-img",
                    dealStrategy: "jsdom",
                    data: [
                        // 图片
                        core.utils.data_builder.array("pictures", ["li"], [], [
                            core.utils.data_builder.normal("title", ["img"], [], {
                                attr: ["title"]
                            }),
                            core.utils.data_builder.normal("url", ["img"], [], {
                                attr: ["src"]
                            })
                        ])
                    ]
                },
                position: {
                    selector: ".intro .container .fl a",
                    dealStrategy: "jsdom",
                    data: [
                        // 城市
                        core.utils.data_builder.combine(core.utils.data_builder.normal("city", [{eq: [1]}]), {
                            formats: [
                                {str: []}, {
                                    replace: {
                                        regexp: /小区/.toString(),
                                        scope: "i",
                                        repStr: ""
                                    }
                                }
                            ]
                        }),
                        core.utils.data_builder.combine(core.utils.data_builder.normal("area", [{eq: [2]}]), {
                            formats: [
                                {str: []}, {
                                    replace: {
                                        regexp: /小区/.toString(),
                                        scope: "i",
                                        repStr: ""
                                    }
                                }
                            ]
                        })
                    ]
                },
                priceInfo: {
                    selector: ".res-info .priceInfo .item:eq(0) p:eq(1)",
                    dealStrategy: "jsdom",
                    data: [
                        // 均价单位
                        core.utils.data_builder.normal("averagePriceUnit", [".u"]),
                        // 均价
                        core.utils.data_builder.normal("averagePrice", [".p"], ["img"])
                    ]
                },
                refPriceInfo: {
                    selector: ".res-info .priceInfo .item:eq(1) p:eq(1)",
                    dealStrategy: "jsdom",
                    data: [
                        // 均价单位
                        core.utils.data_builder.normal("refPriceUnit", [".u"]),
                        // 均价
                        core.utils.data_builder.normal("refPrice", [".p"], ["img"])
                    ]
                },
                geoInfo: {
                    selector: ".zone-map.js_content",
                    dealStrategy: "jsdom",
                    data: [
                        // 位置信息
                        core.utils.data_builder.object("geoBaidu", [
                            // 经度
                            core.utils.data_builder.normal("lat", [], [], {
                                attr: ["latitude"]
                            }, [core.utils.data_builder.formats.num]),
                            // 纬度
                            core.utils.data_builder.normal("lon", [], [], {
                                attr: ["longitude"]
                            }, [core.utils.data_builder.formats.num])
                        ])
                    ]
                },
                // 基本信息
                baseInfo: {
                    selector: ".res-info .col-2 ol",
                    dealStrategy: "jsdom",
                    data: [
                        // 建造年代
                        core.utils.data_builder.normal("buildingTime", ["li:eq(0) .other"]),
                        // 物业费
                        core.utils.data_builder.normal("propertyFee", ["li:eq(1) .other"]),
                        // 物业公司
                        core.utils.data_builder.normal("propertyCompany", ["li:eq(2) .other"]),
                        // 开发商
                        core.utils.data_builder.normal("developerName", ["li:eq(3) .other"]),
                        // 总楼栋数
                        core.utils.data_builder.normal("buildingAmount", ["li:eq(4) .other"]),
                        // 总房屋数量
                        core.utils.data_builder.normal("roomAmount", ["li:eq(5) .other"]),
                        // 容积率
                        core.utils.data_builder.normal("volumeRate", ["li:eq(6) .other"], []),
                        // 绿化率
                        core.utils.data_builder.normal("greeningRate", ["li:eq(7) .other"])
                    ]
                }
            }
        };
    };
};