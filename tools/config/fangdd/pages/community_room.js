module.exports = (core) => {
    return (config) => {
        config.pages.room = {
            key: "crawler.room",
            rule: [{
                regexp: /\/shanghai\/\d*.html/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: true,
            strictField: "community",
            test: false,
            area: {
                none: {
                    data: [
                        // 特色标签
                        core.utils.data_builder.array("tags", [".tag-div .tag"], [], [
                            core.utils.data_builder.normal("")
                        ])
                    ]
                },
                houseInfo: {
                    selector: ".house__info",
                    dealStrategy: "jsdom",
                    data: [
                        // 小区
                        core.utils.data_builder.normal("community", [".house__name .tit:eq(0)"]),
                        // 房型
                        core.utils.data_builder.normal("layout", [".house__name .tit:eq(1)"]),
                        // 面积
                        core.utils.data_builder.combine(core.utils.data_builder.normal("sumArea", [".house__name .tit:eq(2)"]), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 总价
                        core.utils.data_builder.normal("sumPrice", [".house__price .price"]),
                        // 地址
                        core.utils.data_builder.normal("address", [".house__address .address .road"]),
                        //版块
                        core.utils.data_builder.normal("plate", [".house__address .address .link"])
                    ]
                },
                baseInfo: {
                    selector: ".house__info .house__detail table tbody",
                    dealStrategy: "jsdom",
                    data: [
                        // 单价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("price", ["tr:eq(0) td:eq(0)"]), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 楼层
                        core.utils.data_builder.combine(core.utils.data_builder.normal("floor", ["tr:eq(0) td:eq(1)"]), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 竣工时间
                        core.utils.data_builder.normal("completeTime", ["tr:eq(0) td:eq(2)"]),
                        // 房型
                        core.utils.data_builder.combine(core.utils.data_builder.normal("propertyType", ["tr:eq(1) td:eq(0)"]), {
                            formats: [{ str: [] }, {
                                replace: {
                                    regexp: /房型：/.toString(),
                                    scope: "g"
                                }
                            }]
                        }),
                        // 产权
                        core.utils.data_builder.combine(core.utils.data_builder.normal("propertyAge", ["tr:eq(1) td:eq(1)"]), {
                            formats: [core.utils.data_builder.formats.match.price, core.utils.data_builder.formats.num]
                        }),
                        // 房源编号
                        core.utils.data_builder.combine(core.utils.data_builder.normal("no", ["tr:eq(1) td:eq(2)"]), {
                            formats: [core.utils.data_builder.formats.match.price, core.utils.data_builder.formats.num]
                        })
                    ]
                }
            },
            ajax: {}
        };
    };
};