module.exports = (core) => {
    return (config) => {
        config.pages.error = {
            key: "crawler.error",
            test: true,
            area: {
                none: {
                    selector: "#verify_page .verify_info",
                    data: [
                        core.utils.data_builder.normal("verifyInfo", [], [], { size: [] }),
                        core.utils.data_builder.normal("code", [".code"], [], { size: [] })
                    ]
                }
            },
            ajax: {}
        };
    };
};