const mysql = require('mysql');
const config = require("../config");

module.exports = class DatabaseConnection {
    constructor() {
        this.host = config.database.host;
        this.user = config.database.user;
        this.password = config.database.password;
        this.database = config.database.database;
        this.isConnected = false;
    }

    async connect() {
        return new Promise((resolve,reject)=> {
            this.isConnected = false;
            this.connection = mysql.createConnection({
                host: this.host,
                user: this.user,
                password: this.password,
                database: this.database
            });
            this.connection.connect((err) => {
                this.isConnected = !err;
                err ? reject() : resolve(true);
            });
        });
    }

    terminate() {
        if(this.isConnected) {
            this.connection.end();
            this.isConnected = false;
        }
    }
};
