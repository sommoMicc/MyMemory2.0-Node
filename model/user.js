const bcrypt = require("bcrypt");

module.exports = (db) => {

    return class User {
        constructor(id, username, password = null) {
            this.ID = (id != null && parseInt(id)) > 0 ? parseInt(id) : null;
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
            return new Promise((resolve,reject)=> {
                if(this.ID == null) return resolve(false);

                db.query("SELECT ID FROM users WHERE ID = ?",
                    [this.username],(err,result) => {

                    if(err) reject(err);
                    resolve(result.length === 0);
                });
            });
        }

        async usernameExists() {
            return new Promise((resolve,reject)=> {
                db.query("SELECT ID FROM users WHERE username = ?",
                    [this.username],(err,result) => {

                        if(err) reject(err);
                        resolve(result.length === 0 ? false : result[0]["ID"]);
                    });
            });
        }


        async load() {
            return new Promise((resolve,reject)=> {
                if(this.ID != null) {
                    db.query("SELECT * FROM users WHERE ID = ?",
                        [this.ID], (err, result) => {
                            this._loadCallback(err, result, resolve, reject)
                        });
                }
                else {
                    db.query("SELECT * FROM users WHERE username = ?",
                        [this.username], (err, result) => {
                            this._loadCallback(err, result, resolve, reject);
                        });
                }
            });
        }

        _loadCallback(err, result, resolve, reject) {
            if (err) return reject(err);
            if(result.length < 1) return reject("User does not exists");
            this._updateFromObject(result[0]);
        }


        _updateFromObject(object) {
            this.ID = object.ID;
            this.username = object.username;
            this.password = object.password;
        }

        async save() {
            return new Promise((resolve,reject)=>{
                this.exists().then((result)=>{
                    if(result === false) {
                        this._insert().then(()=>{
                            resolve();
                        }).catch((e)=>{
                            reject(e);
                        });
                    }
                    else {
                        this.ID = result;
                        this._update().then(()=>{
                            resolve();
                        }).catch((e)=>{
                            reject(e);
                        });
                    }
                });
            });
        }

        async _insert() {
            return new Promise((resolve,reject) => {
                db.query("INSERT INTO users (username, password) VALUES (?,?,?)",
                    [this.username, this.password], (err, result) => {
                        if(err) return reject(err);
                        this.ID = result.insertedId;
                        resolve(true);
                    });
            });
        }

        async _update() {
            return new Promise((resolve,reject) => {
                db.query("UPDATE users SET username = ?, password = ? WHERE ID = ?"
                    [this.username, this.password, this.ID], (err) => {
                        if(err) return reject(err);
                        resolve(true);
                    });
            });

        }
    }
};