module.exports = (core) => {
    return (config) => {
        config.pages.room = {
            key: "crawler.room",
            rule: [{
                regexp: /\/ershoufang\/\D+\d+.html/.toString(),
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
                        core.utils.data_builder.array("tags", [".featureTag span"], [], [
                            core.utils.data_builder.normal("")
                        ]),
                        // 卖点
                        core.utils.data_builder.normal("sellingPoint", ["h1.main"])
                    ]
                },
                album: {
                    selector: ".esf-top .album-box .album-panel .album-view-wrap ul",
                    dealStrategy: "jsdom",
                    data: [
                        // 楼盘二手房图片
                        core.utils.data_builder.array("pictures", ["li"], [], [
                            core.utils.data_builder.normal("title", ["img"], [], {
                                attr: ["img-title"]
                            }),
                            core.utils.data_builder.normal("url", ["img"], [], {
                                attr: ["data-large"]
                            })
                        ])
                    ]
                },
                baseInfo: {
                    selector: ".esf-top .cj-cun .content",
                    dealStrategy: "jsdom",
                    data: [
                        // 总价
                        core.utils.data_builder.normal("sumPrice", [".houseInfo .price"]),
                        // 面积
                        core.utils.data_builder.normal("sumArea", [".houseInfo .area"]),
                    ]
                },
                moreInfo: {
                    selector: ".esf-top .cj-cun .content .aroundInfo",
                    dealStrategy: "jsdom",
                    data: [
                        // 单价
                        core.utils.data_builder.normal("price", ["tr:eq(0) td:eq(0)"], [".title"]),
                        // 楼层
                        core.utils.data_builder.normal("floor", ["tr:eq(1) td:eq(0)"], [".title"]),
                        // 建造年代
                        core.utils.data_builder.normal("completingTime", ["tr:eq(1) td:eq(1)"], [".title"]),
                        // 装修
                        core.utils.data_builder.normal("decoration", ["tr:eq(2) td:eq(0)"], [".title"]),
                        // 朝向
                        core.utils.data_builder.normal("toward", ["tr:eq(2) td:eq(1)"], [".title"]),
                        // 首付
                        core.utils.data_builder.normal("downPayment", ["tr:eq(3) td:eq(0)"], [".title"]),
                        // 月供
                        core.utils.data_builder.normal("monthPayment", ["tr:eq(3) td:eq(1)"], [".title"]),
                        // 小区
                        core.utils.data_builder.normal("community", ["tr:eq(4) td:eq(0) a"]),
                        // 版块
                        core.utils.data_builder.normal("plate", ["tr:eq(4) td:eq(0) .areaEllipsis"]),
                        // 地址
                        core.utils.data_builder.normal("address", ["tr:eq(5) td:eq(0) .addrEllipsis"]),
                        // 房源编号
                        // core.utils.data_builder.normal("no", ["tr:eq(6) td:eq(0)"])
                    ]
                },
                basicInfo: {
                    selector: ".introContent .base .content ul",
                    dealStrategy: "jsdom",
                    data: [
                        // 房型
                        core.utils.data_builder.normal("layout", ["li:eq(0)"], [".label"]),
                        // 梯户比
                        core.utils.data_builder.normal("floorScale", ["li:eq(4)"], [".label"]),
                    ]
                },
                basicTransactionInfo: {
                    selector: ".introContent .transaction .content ul",
                    dealStrategy: "jsdom",
                    data: [
                        // 上次交易
                        core.utils.data_builder.normal("prevTrade", ["li:eq(0)"], [".label"]),
                        // 房屋类型
                        core.utils.data_builder.normal("type", ["li:eq(1)"], [".label"]),
                        // 房本年限
                        core.utils.data_builder.normal("yearLimit", ["li:eq(2)"], [".label"]),
                        // 是否唯一
                        core.utils.data_builder.normal("isOnly", ["li:eq(3)"], [".label"])
                    ]
                }
            },
            ajax: {}
        };
    };
};