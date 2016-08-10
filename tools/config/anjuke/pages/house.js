module.exports = (core) => {
    return (config) => {
        config.pages.house = {
            key: "crawler.loupan",
            rule: [{
                "regexp": /\/loupan\/canshu-\d+.html/.toString(),
                scope: "i"
            }],
            fieldKey: "name",
            test: false,
            strict: true,
            strictField: "name",
            area: {
                position: {
                    selector: ".crumb-item a",
                    dealStrategy: "jsdom",
                    data: [
                        // 省市
                        core.utils.data_builder.normal("province", [{
                            eq: [0]
                        }]),
                        // 城市
                        core.utils.data_builder.normal("city", [{
                            eq: [1]
                        }]),
                        // 城市
                        core.utils.data_builder.normal("area", [{
                            eq: [2]
                        }]),
                        // 版块
                        core.utils.data_builder.normal("plate", [{
                            eq: [3]
                        }]),
                    ]
                },
                // 基本信息
                baseInfo: {
                    selector: ".can-container .can-item:eq(0) .can-border .list li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".name", [], "楼盘名称", [
                                core.utils.data_builder.normal("name", [".des"], ["i"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "楼盘特点", [
                                core.utils.data_builder.array("tags", [".des a"], [], [
                                    core.utils.data_builder.normal("")
                                ])
                            ]),
                            core.utils.data_builder.cases(".name", [], "参考单价", [
                                core.utils.data_builder.normal("price", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "楼盘总价", [
                                core.utils.data_builder.normal("totalPrice", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "物业类型", [
                                core.utils.data_builder.normal("type", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "开发商", [
                                core.utils.data_builder.normal("developerName", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "区域位置", [
                                core.utils.data_builder.normal("district", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "楼盘地址", [
                                core.utils.data_builder.normal("address", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "售楼处电话", [
                                core.utils.data_builder.normal("sellPhone", [".des"])
                            ])
                        ])
                    ]
                },
                sellInfo: {
                    selector: ".can-container .can-item:eq(1) .can-border .list li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".name", [], "最低首付", [
                                core.utils.data_builder.normal("downPayment", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "开盘时间", [
                                core.utils.data_builder.normal("startTime", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "交房时间", [
                                core.utils.data_builder.normal("deliveryTime", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "售楼处地址", [
                                core.utils.data_builder.normal("sellAddress", [".des"])
                            ])
                        ])
                    ]
                },
                communityInfo: {
                    selector: ".can-container .can-item:eq(2) .can-border .list li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".name", [], "建筑类型", [
                                core.utils.data_builder.normal("buildingType", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "产权年限", [
                                core.utils.data_builder.normal("propertyAge", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "装修标准", [
                                core.utils.data_builder.normal("decorationStandard", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "容积率", [
                                core.utils.data_builder.normal("volumeRate", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "绿化率", [
                                core.utils.data_builder.normal("greeningRate", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "规划户数", [
                                core.utils.data_builder.normal("totalHouseholds", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "楼层状况", [
                                core.utils.data_builder.normal("floorInfo", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "工程进度", [
                                core.utils.data_builder.normal("jobProgress", [".des"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "物业管理费", [
                                core.utils.data_builder.normal("propertyFee", [".des"]),
                            ]),
                            core.utils.data_builder.cases(".name", [], "物业公司", [
                                core.utils.data_builder.normal("propertyCompany", [".des"]),
                            ]),
                            core.utils.data_builder.cases(".name", [], "车位比", [
                                core.utils.data_builder.normal("parkingAmount", [".des"]),
                            ])
                        ])
                    ]
                },
                moreInfo: {
                    selector: ".can-container .can-item:eq(3) .can-border .list li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".name", [], "最新动态", [
                                core.utils.data_builder.normal("latestNews", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "最新楼评", [
                                core.utils.data_builder.normal("latestComment", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "最新画报", [
                                core.utils.data_builder.normal("latestPictorial", [".des"], [".space"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "最新导购", [
                                core.utils.data_builder.normal("latestDynamic", [".des"], [".space"])
                            ])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};