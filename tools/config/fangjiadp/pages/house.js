module.exports = (core) => {
    return (config) => {
        config.pages.house = {
            key: "crawler.loupan",
            rule: [{
                "regexp": /\/shanghai\/newhouse\/loudetail\/\d+/.toString(),
                scope: "i"
            }],
            fieldKey: "name",
            test: false,
            strict: true,
            strictField: "name",
            area: {
                none: {
                    data: [
                        // 电话
                        core.utils.data_builder.normal("sellPhone", [".property_f li:last span"]),
                        // 小区名
                        core.utils.data_builder.normal("name", [".new_room_t_l .a_t"]),
                    ]
                }
            },
            ajax: {}
        };
    };
};