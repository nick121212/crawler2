/**
 * Created by NICK on 16/8/22.
 */

const loginAction = require("./login");
const esfAction = require("./ershoufang");
const core = require("../core");
const _ = require('lodash');

function getEsf(page, perPage, cookie) {
    let total = 0;

    return esfAction(cookie, page, perPage).then((results) => {
        let bodies = [];

        total = results.total;
        _.each(results.rows, (res) => {
            bodies.push({
                index: {
                    _index: "lansi",
                    _type: "esfjy",
                    _id: res.BargainOnGuid
                }
            });
            bodies.push(res);
        });

        return core.elastic.bulk({
            body: bodies
        });

    }).then(() => {
        page++;

        console.log("totalPage:", total / perPage);

        if (total < page * perPage) {
            console.log("done");
            return;
        }

        getEsf(page, perPage, cookie)
    }).catch(console.error);
}


loginAction().then((cookie) => {
    let page = 1;
    let perPage = 100;

    getEsf(page, perPage, cookie);

}, console.error);