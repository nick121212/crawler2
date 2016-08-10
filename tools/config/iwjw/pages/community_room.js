module.exports = (core) => {
    return (config) => {
        config.pages.room = {
            key: "crawler.room",
            rule: [{
                regexp: /\/sale\/([1-9]|[a-z]|[A-Z]){11}/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: true,
            strictField: "community",
            test: false,
            area: {
                none: {
                    data: [
                        // 图片
                        core.utils.data_builder.array("pictures", [".img-ul li"], [], [
                            core.utils.data_builder.normal("title", [".dicon-imgInfo .pic-desc"], [], {
                                attr: ["title"]
                            }),
                            core.utils.data_builder.normal("url", [".house-img-m"], [], {
                                attr: ["src"]
                            })
                        ]),
                        // 地址
                        core.utils.data_builder.normal("address", [".estate-more"])
                    ]
                },
                baseInfo: {
                    selector: ".detail-infos .detailInfo",
                    dealStrategy: "jsdom",
                    data: [
                        // 小区
                        core.utils.data_builder.normal("community", [".detail-title-h1"]),
                        //版块
                        core.utils.data_builder.normal("plate", [".estate-title-h2.need-cut"]),
                        // 房型
                        core.utils.data_builder.normal("layout", [".estate-title-info .g-fence span:eq(1)"]),
                        // 面积
                        core.utils.data_builder.normal("sumArea", [".estate-title-info .g-fence span:eq(0) i"]),
                        // 总价
                        core.utils.data_builder.normal("sumPrice", [".estate-title-info .g-fence span:eq(2) i"]),
                    ]
                },
                detailInfo: {
                    selector: ".detail-infos .detailInfo .list-infos .item-infos p",
                    dealStrategy: "jsdom",
                    data: [
                        core.utils.data_builder.switchs([], [], [
                            core.utils.data_builder.cases(".pname", [], "单价：", [
                                core.utils.data_builder.combine(core.utils.data_builder.normal("price", [], [".pname"]), {
                                    formats: [
                                        core.utils.data_builder.formats.match.price
                                    ]
                                })
                            ]),
                            core.utils.data_builder.cases(".pname", [], "首付：", [
                                core.utils.data_builder.combine(core.utils.data_builder.normal("downPayment", [], [".pname"]), {
                                    formats: [
                                        core.utils.data_builder.formats.match.price
                                    ]
                                })
                            ]),
                            core.utils.data_builder.cases(".pname", [], "参考月供：", [
                                core.utils.data_builder.combine(core.utils.data_builder.normal("monthPayment", [], [".pname"]), {
                                    formats: [
                                        core.utils.data_builder.formats.match.price
                                    ]
                                })
                            ]),
                            core.utils.data_builder.cases(".pname", [], "楼层：", [
                                core.utils.data_builder.normal("floor", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "建造年代：", [
                                core.utils.data_builder.normal("completingTime", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "电梯：", [
                                core.utils.data_builder.normal("lift", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "楼面户数：", [
                                core.utils.data_builder.normal("floorScale", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "朝向：", [
                                core.utils.data_builder.normal("toward", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "装修：", [
                                core.utils.data_builder.normal("decoration", [], [".pname"])
                            ]),
                            core.utils.data_builder.cases(".pname", [], "特色：", [
                                core.utils.data_builder.array("tags", ["em"], [], [
                                    core.utils.data_builder.normal("")
                                ])
                            ])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};