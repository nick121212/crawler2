module.exports = (core) => {
    return (config) => {
        config.pages.poi = {
            key: "crawler.poi",
            rule: [{
                regexp: /\/poi\/[1-9|a-z|A-Z|_]+\/$/.toString(),
                scope: "i"
            }],
            fieldKey: "",
            test: false,
            area: {
                none: {
                    data: [
                        // 简介
                        core.utils.data_builder.normal("introduce", [".poiDet-detail"]),
                    ]
                },
                position: {
                    selector: ".qyer_head_crumb .text",
                    dealStrategy: "jsdom",
                    data: [
                        // 国家
                        core.utils.data_builder.normal("country", [{ eq: [1] }, "a"]),
                        // 城市
                        core.utils.data_builder.normal("city", [{ eq: [2] }, "a"]),
                    ]
                },
                names: {
                    selector: ".poiDet-largeTit",
                    dealStrategy: "jsdom",
                    data: [
                        // 英文名字
                        core.utils.data_builder.normal("nameEn", [".en a"]),
                        // 中文名字
                        core.utils.data_builder.normal("nameCn", [".cn a"], []),
                        // 小贴士
                        core.utils.data_builder.normal("nameCn", [".poiDet-tipContent .content p"], [], { html: [] }),
                    ]
                },
                placeInfo: {
                    selector: ".poiDet-placeinfo",
                    dealStrategy: "jsdom",
                    data: [
                        // 评分
                        core.utils.data_builder.normal("score", [".points .number"]),
                        // 评论数量
                        core.utils.data_builder.combine(core.utils.data_builder.normal("commentCount", [".poiDet-stars .summery a"]), {
                            formats: [{ str: [] }, {
                                match: {
                                    regexp: /\d+/.toString(),
                                    scope: "ig",
                                    index: 0
                                }
                            }, { num: [] }]
                        }),
                        // 排名
                        core.utils.data_builder.combine(core.utils.data_builder.normal("rank", [".rank span"]), {
                            formats: [{ str: [] }, {
                                match: {
                                    regexp: /\d+/.toString(),
                                    scope: "ig",
                                    index: 0
                                }
                            }, { num: [] }]
                        })
                    ]
                },
                tips: {
                    selector: ".poiDet-tips li",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".title", [], "地址：", [
                                core.utils.data_builder.normal("address", [".content p"], ["a"])
                            ]),
                            core.utils.data_builder.cases(".title", [], "到达方式：", [
                                core.utils.data_builder.normal("traffic", [".content p"], ["a"])
                            ]),
                            core.utils.data_builder.cases(".title", [], "开放时间：", [
                                core.utils.data_builder.normal("openDateStr", [".content p"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "门票：", [
                                core.utils.data_builder.normal("latestDynamic", [".content p"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "电话：", [
                                core.utils.data_builder.normal("concatPhone", [".content p"])
                            ]),
                            core.utils.data_builder.cases(".name", [], "网址：", [
                                core.utils.data_builder.normal("eurl", [".content p"])
                            ])
                        ])
                    ]
                },
                date: {
                    selector: ".poiDet-date",
                    dealStrategy: "jsdom",
                    data: [
                        // 更新者
                        core.utils.data_builder.array("updator", ["span a"], [], [
                            core.utils.data_builder.normal("name", []),
                            core.utils.data_builder.normal("link", [], [], { attr: ["href"] })
                        ]),
                        // 更新时间
                        core.utils.data_builder.combine(core.utils.data_builder.normal("updatedEditAt", ["span:eq(0)"], ["a"]), {
                            formats: [{ "str": [] }, {
                                match: {
                                    regexp: /\d*-\d*-\d*/.toString(),
                                    scope: "ig",
                                    index: 0
                                },
                                num: []
                            }]
                        })
                    ]
                },
                commentlist: {
                    selector: ".commentlist > ul li",
                    daelStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.array("comments", [], [], [
                            // 用户信息
                            core.utils.data_builder.object("user", [
                                core.utils.data_builder.normal("avatar", [".largeavatar img"], [], { attr: ["src"] }),
                                core.utils.data_builder.normal("nickname", [".largeavatar span"]),
                                core.utils.data_builder.normal("href", [".largeavatar"], [], { attr: ["href"] }),
                            ]),
                            // 评论日志
                            core.utils.data_builder.normal("createdAt", [".comment .title .date"]),
                            // 评论内容
                            core.utils.data_builder.normal("content", [".comment .content"], [], { html: [] }),
                            // 评论的星星数量
                            core.utils.data_builder.normal("stars", [".comment .poiDet-stars em.full"], [], { size: [] }),
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};