module.exports = (core) => {
    return (config) => {
        config.pages.community = {
            key: "crawler.community",
            rule: [{
                "regexp": /\/xiaoqu\/g\d+/.toString(),
                scope: "i"
            }],
            fieldKey: "name",
            strict: false,
            strictField: "name",
            test: false,
            area: {
                none: {
                    selector: ".house-listBox .house-item",
                    data: [
                        core.utils.data_builder.array("communies", [], [], [
                            core.utils.data_builder.normal("name", [".house-title a"]),
                            core.utils.data_builder.normal("plate", [".item-info .mb_10:eq(0)"], [], { text: [] }, [
                                core.utils.data_builder.formats.str, {
                                    split: { splitOf: ' ', start: 0, end: 2, join: ' ' }
                                }
                            ]),
                            core.utils.data_builder.normal("address", [".item-info .mb_10:eq(0)"], [], { text: [] }, [
                                core.utils.data_builder.formats.str, {
                                    split: { splitOf: ' ', start: 2, join: '' }
                                }
                            ]),
                            core.utils.data_builder.normal("buildingTime", [".item-info .mb_10:eq(1)"])
                        ]),
                    ]
                }
            }
        };
    };
};