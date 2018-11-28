const bcrypt = require("bcrypt");

module.exports = (dbConnection) => {

    return class User {
        constructor(id, username, password = null) {
            this.ID = (id != null && parseInt(id)) > 0 ? id : null;
            this.username = username;
            this.password = password;
        }

        async setPlainPassword(plain) {
            return new Promise((resolve, reject) => {
                User.hashPassword(plain).then((hash) => {
                    this.password = hash;
                    resolve(hash);
                }).catch(() => {
                    reject("Password hash not computed");
                });
            });
        }

        static async hashPassword(text) {
            return new Promise((resolve, reject) => {
                bcrypt.hash(text, 12, (err, hash) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(hash);
                    }
                });
            });
        }

        async isPasswordValid(otherPassword) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(otherPassword, this.password, function (err, res) {
                    (!err && res) ? resolve(true) : reject("Password not valid");
                });
            })
        }

        async exists() {

        }
    }
};