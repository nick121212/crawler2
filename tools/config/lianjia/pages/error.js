module.exports = (core) => {
    return (config) => {
        config.pages.error = {
            key: "crawler.error",
            test: true,
            area: {
                none: {
                    selector: ".errorMessageInfo",
                    data: [
                        core.utils.data_builder.normal("btn_goHome", [], [], { size: [] }),
                    ]
                }
            },
            ajax: {}
        };
    };
};