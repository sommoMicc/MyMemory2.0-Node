const bcrypt = require("bcrypt");
const databaseConnection = require("databaseConnection");

module.exports = class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    setPlainPassword(plain,callback) {
        User.hashPassword(plain,(hash) => {
            if (hash !== false) {
                this.password = hash;
                callback(hash)
            }
            else {
                callback(false);
            }
        });
    }

    static hashPassword(text,callback) {
        bcrypt.hash(text, 12, function(err, hash) {
            (err) ? callback(false) : callback(hash);
        });
    }

    isPasswordValid(otherPassword, callback) {
        bcrypt.compare(otherPassword, this.password, function(err, res) {
            callback(!err && res);
        });

    }
};