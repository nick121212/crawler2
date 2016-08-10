let developer = require("./developer");
let production = require("./production");
let env = process.env.ENV || 'development'

module.exports = exports = env === "development" ? developer : production;