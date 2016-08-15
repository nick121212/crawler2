module.exports = (core) => {
    return (config) => {
        // http://sh.fang.anjuke.com/loupan/huxing-246309.html
        config.pages.layout = {
            key: "crawler.layouts",
            rule: [{
                regexp: /\/loupan\/huxing-\d+\/s/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/huxing-\d+(\.html)/.toString(),
                scope: "i"
            }],
            priority: 3,
            fieldKey: "random",
            test: false,
            strict: true,
            strictField: "name",
            // download: [{
            //     each: "layouts",
            //     field: "url"
            // }],
            area: {
                none: {
                    data: [
                        // 楼盘名称
                        core.utils.data_builder.normal("name", [".lp-info .lp-tit h1"]),
                        // 户型
                        core.utils.data_builder.array("layouts", [".hx-list li"], [], [
                            core.utils.data_builder.normal("url", ["img"], [], { attr: ["imglazyload-src"] }),
                            core.utils.data_builder.normal("title", ["img"], [], { attr: ["title"] }),
                            core.utils.data_builder.normal("name", [".descrip:eq(0) .desc-k"], []),
                            core.utils.data_builder.normal("layout", [".descrip:eq(0) .desc-v"], []),
                            core.utils.data_builder.normal("area", [".descrip:eq(1) .desc-v"], [])
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};