module.exports = (core) => {
    return (config) => {
        config.pages.picture = {
            key: "crawler.pictures",
            extendData: {
                type: 1
            },
            rule: [{
                regexp: /\/loupan\/xiangce-\d+\/hb.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/ybj.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/sjt.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/xgt.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/ght.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/ptt.html/.toString(),
                scope: "i"
            }, {
                regexp: /\/loupan\/xiangce-\d+\/wzt.html/.toString(),
                scope: "i"
            }],
            fieldKey: "random",
            test: false,
            strict: true,
            strictField: "name",
            download: [{
                each: "pictures.url"
            }],
            area: {
                none: {
                    data: [
                        // 楼盘名称
                        core.utils.data_builder.normal("name", [".lp-info .lp-tit h1"]),
                        // 图片列表
                        core.utils.data_builder.array("pictures", [".xiangce-list li"], [], [
                            core.utils.data_builder.normal("url", ["img"], [], { attr: ["imglazyload-src"] }),
                            core.utils.data_builder.normal("title", [".album-des"]),
                            core.utils.data_builder.normal("date", [".album-time"]),
                        ])
                    ]
                }
            },
            ajax: {}
        };
    };
};