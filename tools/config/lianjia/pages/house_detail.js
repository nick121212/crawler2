module.exports = (core) => {
    return (config) => {
        config.pages.loupanDetail = {
            key: "crawler.loupan",
            rule: [{
                "regexp": /\/list\/pg\d+/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: false,
            strictField: "name",
            test: false,
            area: {
                position: {
                    selector: ".breadcrumbs a",
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
                    selector: ".banner-box .box-left",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.normal("name", [".name-box a"], []),
                        core.utils.data_builder.normal("state", [".name-box .state-div .state"], []),
                        core.utils.data_builder.array("tags", [".box-left-bottom.clickTargetBox .small-tags span"], [], [
                            core.utils.data_builder.normal("")
                        ]),
                        core.utils.data_builder.normal("type", [".box-left-bottom.clickTargetBox .wu-type span:eq(1)"]),
                        core.utils.data_builder.normal("phone", [".box-left-bottom.clickTargetBox .phone-h .phone-info"], [])
                    ]
                },
                propertyInfo: {
                    selector: "#house-details .box-loupan",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.normal("address", [".desc-p:eq(1) span:eq(1)"], []),
                        core.utils.data_builder.normal("saleAddress", [".desc-p:eq(2) span:eq(1)"], []),
                        core.utils.data_builder.normal("developerName", [".desc-p:eq(3) span:eq(1)"], []),
                        core.utils.data_builder.normal("propertyCompany", [".desc-p:eq(4) span:eq(1)"], [])
                    ]
                },
                moreInfo: {
                    selector: "#house-details .box-loupan .table-list li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".desc-p .label", [], "最新开盘", [
                                core.utils.data_builder.normal("newCreate", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "最早交房", [
                                core.utils.data_builder.normal("newHouse", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "容积率", [
                                core.utils.data_builder.normal("volumeRate", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "产权年限", [
                                core.utils.data_builder.normal("propertyAge", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "绿化率", [
                                core.utils.data_builder.normal("greeningRate", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "规划户数", [
                                core.utils.data_builder.normal("totalHouseholds", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "物业费用", [
                                core.utils.data_builder.normal("propertyFee", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "车位情况", [
                                core.utils.data_builder.normal("parkingAmount", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "供暖方式", [
                                core.utils.data_builder.normal("heatInfo", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "装修状况", [
                                core.utils.data_builder.normal("decorationStandard", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "水电燃气", [
                                core.utils.data_builder.normal("hydroelectric", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "建筑类型", [
                                core.utils.data_builder.normal("buildingType", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "嫌恶设施", [
                                core.utils.data_builder.normal("detestBuild", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "占地面积", [
                                core.utils.data_builder.normal("areaAmount", [".desc-p .label-val"], [])
                            ]),
                            core.utils.data_builder.cases(".desc-p .label", [], "建筑面积", [
                                core.utils.data_builder.normal("buildingAmount", [".desc-p .label-val"], [])
                            ])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};