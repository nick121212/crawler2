module.exports = (core) => {
    return (config) => {
        config.pages.room = {
            key: "crawler.room",
            rule: [{
                regexp: /\/ershoufang\/(.*?).html/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: true,
            strictField: "community",
            test: false,
            area: {
                none: {
                    data: [
                        core.utils.data_builder.array("pictures", [".picBox ul li"], [], [
                            core.utils.data_builder.normal("url", ["img"], [], {
                                attr: ["lazysrc"]
                            })
                        ])
                    ]
                },
                roomDetail: {
                    selector: ".roomDetail .roominfor dd",
                    dealStrategy: "jsdom",
                    data: [
                        // 卖点
                        core.utils.data_builder.normal("sellingPoint", ["h5"]),
                        // 标签
                        core.utils.data_builder.array("tags", [".labeltag span:not(.f999)"], [], [
                            core.utils.data_builder.normal("")
                        ]),
                    ]
                },
                baseInfo: {
                    selector: ".roombase-box .roombase-infor .roombase-top .roombase-price ",
                    dealStrategy: "jsdom",
                    data: [
                        // 总价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("sumPrice", ["span:eq(0)"], []), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 房型
                        core.utils.data_builder.normal("layout", ["span:eq(2)"], []),
                        // 面积
                        core.utils.data_builder.combine(core.utils.data_builder.normal("sumArea", ["span:eq(4)"], []), {
                            formats: [core.utils.data_builder.formats.match.price]
                        })
                    ]
                },
                moreInfo: {
                    selector: ".roombase-box .roombase-infor .roombase-top .hbase_txt",
                    dealStrategy: "jsdom",
                    data: [
                        // 单价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("price", ["li:eq(0) .txt_r"], ["a"]), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 朝向
                        core.utils.data_builder.normal("toward", ["li:eq(1) .txt_r"], []),
                        // 建造年代
                        core.utils.data_builder.normal("completingTime", ["li:eq(2) .txt_r"], []),
                        // 楼层
                        core.utils.data_builder.normal("floor", ["li:eq(3) .txt_r"], []),
                        // 装修
                        core.utils.data_builder.normal("decoration", ["li:eq(4) .txt_r"], []),
                        // 小区名
                        core.utils.data_builder.normal("community", ["li:eq(5) .txt_r"], [])
                    ]
                }
            },
            ajax: {}
        };
    };
};