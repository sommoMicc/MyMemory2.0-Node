const mysql = require('mysql');
const config = require("../config");

class DatabaseConnection {
    constructor() {
        this.host = config.database.host;
        this.user = config.database.user;
        this.password = config.database.password;
        this.database = config.database.database;
    }

    connect(callback) {
        const connection = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });
        connection.connect((err) => {
            callback(!err);
        });

    }
}

let databaseConnection = new DatabaseConnection();
module.exports = databaseConnection;