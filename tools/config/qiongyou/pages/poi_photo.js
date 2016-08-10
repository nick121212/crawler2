module.exports = (core) => {
    return (config) => {
        config.pages.poiPhoto = {
            key: "crawler.poi.photo",
            rule: [{
                regexp: /\/poi\/[1-9|a-z|A-Z|_]+\/photo(?:\/page\d+|)\/?$/.toString(),
                scope: "i"
            }],
            fieldKey: "",
            test: false,
            area: {
                none: {
                    data: [
                        // poi名称
                        core.utils.data_builder.normal("nameCh", [".pl_topbox_cn a"]),
                        core.utils.data_builder.normal("nameEn", [".pl_topbox_en a"]),
                        // 照片信息
                        core.utils.data_builder.array("pictures", [".pla_photolist li"], [], [
                            core.utils.data_builder.object("userInfo", [
                                core.utils.data_builder.normal("nickname", [".info a:eq(0)"]),
                                core.utils.data_builder.normal("link", [".info a:eq(0)"], [], { attr: ["href"] }),
                            ]),
                            core.utils.data_builder.object("placeInfo", [
                                core.utils.data_builder.normal("title", [".info a:eq(1)"]),
                                core.utils.data_builder.normal("link", [".info a:eq(1)"], [], { attr: ["href"] }),
                            ]),
                            core.utils.data_builder.normal("url", [".pic img"], { attr: ["src"] })
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};