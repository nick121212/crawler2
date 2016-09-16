module.exports = (core) => {
    return (config) => {
        config.pages.broker = {
            key: "crawler.broker",
            extendData: {},
            rule: [{
                regexp: /\/tycoon(?:\/p\d+|)\/?$/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: false,
            strictField: "name",
            test: false,
            area: {
                none: {
                    data: [
                        core.utils.data_builder.array("brokers", [".list-content .jjr-itemmod"], [], [
                            core.utils.data_builder.normal("avatar", ["a.img img"], [], {attr: ["src"]}),
                            core.utils.data_builder.normal("href", ["a.img"], [], {attr: ["href"]}),
                            core.utils.data_builder.normal("name", [".jjr-info h3 a"]),
                            core.utils.data_builder.normal("intro", [".jjr-info .manifesto"]),
                            core.utils.data_builder.normal("company", [".jjr-info p:not([class]) a:eq(0)"]),
                            core.utils.data_builder.normal("store", [".jjr-info p:not([class]) a:eq(1)"]),
                            core.utils.data_builder.array("communities", [".jjr-info .xq_tag a"], [], [
                                core.utils.data_builder.normal("")
                            ]),
                            core.utils.data_builder.normal("phone", [".jjr-side"], [".tel-icon"])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};