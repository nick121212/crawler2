module.exports = (core) => {
    return (config) => {
        config.pages.community = {
            key: "crawler.community",
            rule: [{
                "regexp": /\/community\/view\/\d+/.toString(),
                scope: "i"
            }],
            fieldKey: "name",
            test: false,
            strict: true,
            strictField: "name",
            area: {
                none: {
                    data: [
                        // 省市
                        core.utils.data_builder.normal("province", [".city"]),
                        // 小区简介
                        core.utils.data_builder.normal("introduction", [".desc-cont"])
                    ]
                },
                position: {
                    selector: ".crumb-item a",
                    dealStrategy: "jsdom",
                    data: [
                        // 城市
                        core.utils.data_builder.normal("city", [{
                            eq: [1]
                        }]),
                        // 地区
                        core.utils.data_builder.normal("area", [{
                            eq: [2]
                        }])
                    ]
                },
                // 基本信息
                baseInfo: {
                    selector: ".left-cont .border-info.comm-basic",
                    dealStrategy: "jsdom",
                    data: [
                        // 小区名称
                        core.utils.data_builder.normal("name", [".comm-cont h1"]),
                        // 均价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("averagePrice", [".mag-b2 em"]), {
                            formats: [
                                { str: [] },
                                { num: [] }
                            ]
                        }),
                        // 均价单位
                        core.utils.data_builder.normal("averagePriceUnit", [".mag-b2 span:eq(0)"]),
                        // 标签
                        core.utils.data_builder.array("tags", [".comm-mark a"], [], [
                            core.utils.data_builder.normal("")
                        ])
                    ]
                },
                overview: {
                    selector: ".left-cont .border-info.comm-detail",
                    dealStrategy: "jsdom",
                    data: [
                        // 版块
                        core.utils.data_builder.normal("plate", [".comm-l-detail dd:eq(1)"]),
                        // 地址
                        core.utils.data_builder.normal("address", [".comm-l-detail dd:eq(2) em"]),
                        // 开发商
                        core.utils.data_builder.normal("developerName", [".comm-l-detail dd:eq(3)"]),
                        // 物业公司
                        core.utils.data_builder.normal("propertyCompany", [".comm-l-detail dd:eq(4)"]),
                        // 物业类型
                        core.utils.data_builder.normal("type", [".comm-l-detail dd:eq(5)"]),
                        // 物业费
                        core.utils.data_builder.normal("propertyFee", [".comm-l-detail dd:eq(6)"]),
                        // 总建筑面积
                        core.utils.data_builder.normal("areaAmount", [".comm-r-detail dd:eq(0)"]),
                        // 总户数
                        core.utils.data_builder.normal("totalHouseholds", [".comm-r-detail dd:eq(1)"]),
                        // 建造年代
                        core.utils.data_builder.normal("buildingTime", [".comm-r-detail dd:eq(2)"]),
                        // 容积率
                        core.utils.data_builder.normal("volumeRate", [".comm-r-detail dd:eq(3)"], []),
                        // 出租率
                        core.utils.data_builder.normal("lettingRate", [".comm-r-detail dd:eq(4)"], []),
                        // 停车位
                        core.utils.data_builder.normal("partingAmount", [".comm-r-detail dd:eq(5)"], []),
                        // 绿化率
                        core.utils.data_builder.normal("greeningRate", [".comm-r-detail dd:eq(6)"])
                    ]
                }
            },
            ajax: {}
        };
    };
};