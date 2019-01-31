const crypto = require("crypto");

module.exports = (db) => {
    const User = require("./user")(db);

    return class Token {
        constructor(value, user_id, creation, expiration) {
            this.value = value;
            this.user_id = user_id;
            this.creation = creation;
            this.expiration = expiration;
        }

        async isValid() {
            return new Promise((resolve,reject)=> {
                if(this.value == null) return resolve(false);

                db.query("SELECT value FROM tokens WHERE value = ? AND creation" +
                    "< NOW() AND (expiration IS NULL OR expiration > NOW())",
                    [this.value],(err,result) => {

                        if(err) reject(err);
                        resolve(result.length > 0);
                    });
            });
        }

        async getUser() {
            let relatedUser = new User(this.user_id,null,null);
            await relatedUser.load();
            return relatedUser;
        }

        static async generate(user_id) {
            let tokenValue = await Token._generateToken();
            let tokenToReturn = new Token(tokenValue,user_id);
            if(await tokenToReturn.isValid()) {
                return this.generate(user_id);
            }
            if(await tokenToReturn.save()) {
                return tokenToReturn;
            }
            else {
                return false;
            }
        }

        static async _generateToken() {
            return new Promise((resolve,reject)=>{
                crypto.randomBytes(36, function(err, buffer) {
                    if(err) reject(err);
                    else resolve(buffer.toString('hex'));
                });
            });
        }

        async load() {
            return new Promise((resolve,reject)=> {
                if(this.value != null) {
                    db.query("SELECT * FROM tokens WHERE value = ?",
                        [this.value], (err, result) => {
                            this._loadCallback(err, result, resolve, reject)
                        });
                }
                else {
                    db.query("SELECT * FROM tokens WHERE user_id = ? AND " +
                        "(expiration IS NULL OR expiration > NOW()) ORDER" +
                        "BY creation DESC LIMIT 1",
                        [this.username,this.email], (err, result) => {
                            this._loadCallback(err, result, resolve, reject);
                        });
                }
            });
        }

        _loadCallback(err, result, resolve, reject) {
            if (err) return reject(err);
            if(result.length < 1) return reject("Token does not exists");
            this._updateFromObject(result[0]);
            resolve(result[0]);
        }


        _updateFromObject(object) {
            this.ID = object.ID;
            this.username = object.username;
            this.email = object.email;
        }

        async save() {
            return new Promise((resolve,reject)=>{
                this.isValid().then((result)=>{
                    if(result === false) {
                        this._insert().then(()=>{
                            resolve(true);
                        }).catch((e)=>{
                            reject(e);
                        });
                    }
                    else {
                        this.value = result;
                        this._update().then(()=>{
                            resolve(true);
                        }).catch((e)=>{
                            reject(e);
                        });
                    }
                });
            });
        }

        async _insert() {
            return new Promise((resolve,reject) => {
                db.query("INSERT INTO tokens (value,user,creation,expiration) " +
                    "VALUES (?,?,NOW(),null)",
                    [this.value, this.user_id], (err) => {
                        if(err) return reject(err);
                        resolve(true);
                    });
            });
        }

        async _update() {
            return new Promise((resolve,reject) => {
                db.query("UPDATE tokens SET user = ?, creation = ?, expiration = ? " +
                    "WHERE value = ?",
                    [this.user_id, this.creation, this.expiration,this.value],
                    (err) => {
                        if(err) return reject(err);
                        resolve(true);
                    });
            });

        }
    }
};