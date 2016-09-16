module.exports = (core) => {
    return (config) => {
        config.pages.broker = {
            key: "crawler.loupan",
            extendData: {},
            rule: [{
                regexp: /\/pg\d+\/$/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            strict: false,
            strictField: "name",
            test: false,
            area: {
                none: {
                    data: [
                        core.utils.data_builder.array("houses", [".halistbox .halist"], [], [
                            core.utils.data_builder.normal("name", [".infobox .title h4 a"]),
                            core.utils.data_builder.normal("status", [".infobox .title .struct"]),
                            core.utils.data_builder.normal("averagePrice", [".infobox .text ul:eq(0) li:eq(0) .mr span"]),
                            core.utils.data_builder.normal("completeTime", [".infobox .text ul:eq(0) li:eq(0) span:last"]),
                            core.utils.data_builder.normal("address", [".infobox .text ul:eq(1) li:eq(0) span[class]"]),
                            core.utils.data_builder.normal("usage", [".infobox .text ul:eq(1) li:eq(1) span[class]"]),
                            core.utils.data_builder.normal("propertyType", [".infobox .text ul:eq(1) li:eq(2) span:eq(1)"])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};