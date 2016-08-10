module.exports = (core) => {
    return (config) => {
        config.pages.room = {
            key: "crawler.room",
            rule: [{
                regexp: /\/shanghai\/esf\/detail\/.+\.html/.toString(),
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
                        core.utils.data_builder.array("tags", [".houseTag span"], [], [
                            core.utils.data_builder.normal("")
                        ]),
                        // 卖点
                        core.utils.data_builder.normal("sellingPoint", [".w-module .content .showUl"]),
                        // 小区名
                        core.utils.data_builder.normal("community", [".xiaoquInfo li:eq(0)"], ["span"]),
                        // 小区图片
                        core.utils.data_builder.array("pictures", [".mainPhotoPlayList .mainPhotoPlayItem:not(.videoItem)"], [], [
                            core.utils.data_builder.normal("url", ["img"], [], {
                                attr: ["src"]
                            })
                        ])
                    ]
                },
                houseInfo1: {
                    selector: ".newHouseInfo .houseData .ul1",
                    dealStrategy: "jsdom",
                    data: [
                        // 房型
                        core.utils.data_builder.normal("layout", ["li:eq(0)"], ["span"]),
                        // 面积
                        core.utils.data_builder.combine(core.utils.data_builder.normal("sumArea", ["li:eq(1)"], ["span"]), {
                            formats: [core.utils.data_builder.formats.match.price]
                        }),
                        // 楼层
                        core.utils.data_builder.normal("floor", ["li:eq(3)"], ["span"]),
                        // 装修
                        core.utils.data_builder.normal("decoration", ["li:eq(2)"], ["span"]),
                    ]
                },
                houseInfo2: {
                    selector: ".newHouseInfo .houseData .ul2",
                    dealStrategy: "jsdom",
                    data: [
                        // 朝向
                        core.utils.data_builder.normal("toward", ["li:eq(1)"], ["span"]),
                        // 首付
                        core.utils.data_builder.combine(core.utils.data_builder.normal("downPayment", ["li:eq(2)"], ["span"]), {
                            formats: [
                                core.utils.data_builder.formats.match.price
                            ]
                        }),
                        // 月供
                        core.utils.data_builder.combine(core.utils.data_builder.normal("monthPayment", ["li:eq(3)"], ["span"]), {
                            formats: [
                                core.utils.data_builder.formats.match.price
                            ]
                        })
                    ]
                },
                houseDataMore: {
                    selector: ".newHouseInfo .houseDataMore",
                    dealStrategy: "jsdom",
                    data: [
                        // 单价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("price", [".price span"]), {
                            formats: [
                                core.utils.data_builder.formats.match.price
                            ]
                        }),
                        // 总价
                        core.utils.data_builder.combine(core.utils.data_builder.normal("sumPrice", [".price"], ["span", "em"]), {
                            formats: [
                                core.utils.data_builder.formats.match.price
                            ]
                        })
                    ]
                }
            },
            ajax: {}
        };
    };
};