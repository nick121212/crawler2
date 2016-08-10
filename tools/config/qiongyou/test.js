let _ = require("lodash");

let regexs = {
    poi: {
        regexp: /\/poi\/[1-9|a-z|A-Z|_]+(?:\/photo\/?(?:\/page\d+|)|)\/?$/i,
        data: [
            "http://place.qyer.com/poi/23232dd/",
            "http://place.qyer.com/poi/V2EJalFkBzZTZ_/",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/review/",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/page1",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/page1/",
        ]
    },
    photo:{
        regexp:/\/poi\/[1-9|a-z|A-Z|_]+\/photo(?:\/page\d+|)\/?$/i,
        data: [
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/page1",
            "http://place.qyer.com/poi/V2EJalFkBzZTZA/photo/page2/",

        ]
    }
};

let keyV = regexs[process.argv[2]];

if (!keyV) return;

for (let key in keyV.data) {
    let data = keyV.data[key];
    let regex = keyV.regexp;

    console[regex.test(data) ? "log" : "error"](data, "-------", regex.test(data));
}