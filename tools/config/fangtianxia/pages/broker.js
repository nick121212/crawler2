module.exports = (core) => {
    return (config) => {
        config.pages.broker = {
            key: "crawler.broker",
            extendData: {},
            rule: [{
                regexp: /\/agenthome-a0\d+-b0\d+\/-i3\d+-j310\/?$/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: false,
            strictField: "name",
            test: false,
            area: {
                none: {
                    data: [
                        core.utils.data_builder.array("brokers", [".agentlist .agent_pic > div"], [], [
                            core.utils.data_builder.normal("avatar", [".pic a img"], [], { attr: ["src"] }),
                            core.utils.data_builder.normal("zhuanjia", [".pic .zhuanjia"], [], { size: [] }),
                            core.utils.data_builder.normal("name", [".house dl dt p.housetitle a:eq(0)"]),

                            core.utils.data_builder.switchs([".house dl dt p"], [], [
                                core.utils.data_builder.cases("", [], "所属公司", [
                                    core.utils.data_builder.normal("company", ["span"], [])
                                ]),
                                core.utils.data_builder.cases("", [], "联系电话", [
                                    core.utils.data_builder.normal("phone", ["strong"], [])
                                ]),
                                core.utils.data_builder.cases("", [], "服务商圈", [
                                    core.utils.data_builder.array("plates", ["a"], [], [
                                        core.utils.data_builder.normal("")
                                    ])
                                ]),
                                core.utils.data_builder.cases("", [], "开店时间", [
                                    core.utils.data_builder.normal("opened", [], [])
                                ]),
                                core.utils.data_builder.cases("", [], "专家楼盘", [
                                    core.utils.data_builder.array("communities", ["a"], [], [
                                        core.utils.data_builder.normal("")
                                    ])
                                ]),
                                core.utils.data_builder.cases("p", [], "职业特长", [
                                    core.utils.data_builder.array("techang", ["span"], [], [
                                        core.utils.data_builder.normal("")
                                    ])
                                ]),
                            ])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};