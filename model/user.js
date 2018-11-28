const bcrypt = require("bcrypt");

module.exports = class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async setPlainPassword(plain) {
        return new Promise((resolve,reject)=>{
            User.hashPassword(plain).then((hash)=>{
                this.password = hash;
                resolve(hash);
            }).catch(()=>{
                reject("Password hash not computed");
            });
        });
    }

    static async hashPassword(text) {
        return new Promise((resolve,reject) => {
            bcrypt.hash(text, 12, (err, hash) => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(hash);
                }
            });
        });
    }

    async isPasswordValid(otherPassword) {
        return new Promise((resolve,reject)=>{
            bcrypt.compare(otherPassword, this.password, function(err, res) {
                (!err && res) ? reject() : resolve(true);
            });
        })
    }

    exists() {

    }
};