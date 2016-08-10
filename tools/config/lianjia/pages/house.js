module.exports = (core) => {
    return (config) => {
        config.pages.loupan = {
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
                none: {
                    data: [
                        // 小区名称
                        core.utils.data_builder.array("list", [".house-lst li"], [], [
                            core.utils.data_builder.normal("name", [".info-panel .col-1 > h2 a"]),
                            core.utils.data_builder.normal("plate", [".info-panel .where .region span"]),
                            core.utils.data_builder.normal("address", [".info-panel .where .region"], ["span"])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};