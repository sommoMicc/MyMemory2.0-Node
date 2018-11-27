const mysql = require('mysql');

module.exports = class DatabaseConnection {
    constructor(host, username, password, database) {
        this.host = host;
        this.username = username;
        this.password = password;
        this.database = database;
    }

    connect(callback) {
        const connection = mysql.createConnection({
            host: this.host,
            user: this.username,
            password: this.password,
            database: this.database
        });
        connection.connect((err) => {
            callback(!err);
        });

    }
};