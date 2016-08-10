/**
 * Created by NICK on 16/8/2.
 */

let Sequelize = require("sequelize");
let config = require("../config");
let sequelizeImport = require("sequelize-import");

let sequelize = new Sequelize(config.database.name, config.database.username, config.database.password, config.database.settings);

let models = sequelizeImport(__dirname + '/../models', sequelize, {
    exclude: ['index.js']
});

sequelize.authenticate().then(() => {
    console.log("数据库连接成功");
}).catch((err) => {
    console.error("数据库链接失败" + err.message);
});

module.exports = exports = {
    models: models,
    sequelize: sequelize,
    Sequelize: Sequelize
};