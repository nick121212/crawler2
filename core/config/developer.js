let ip = "192.168.222.185";

module.exports = exports = {
    elastic: {
        host: ip,
        port: 9200
    },
    q: {
        host: ip,
        user: "nick",
        password: "111111"
    },
    database: {
        name: "longyan_online_20160629_09",
        username: "admin",
        password: "dbadmin@#",
        settings: {
            host: "192.168.221.11",
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        }
    }
};