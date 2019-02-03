module.exports = (db) => {

    return class User {
        constructor(id, username=null, email=null) {
            this.ID = (id != null && parseInt(id)) > 0 ? parseInt(id) : null;
            this.username = username;
            this.email = email == null ? null : email.toLowerCase();
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

        async emailExists() {
            return new Promise((resolve,reject)=> {
                db.query("SELECT ID FROM users WHERE email = ?",
                    [this.email],(err,result) => {
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
                    db.query("SELECT * FROM users WHERE username = ? OR email = ?",
                        [this.username,this.email], (err, result) => {
                            this._loadCallback(err, result, resolve, reject);
                        });
                }
            });
        }

        _loadCallback(err, result, resolve, reject) {
            if (err) return reject(err);
            if(result.length < 1) return reject("User does not exists");
            this._updateFromObject(result[0]);
            resolve(result[0]);
        }


        _updateFromObject(object) {
            this.ID = object.ID;
            this.username = object.username;
            this.email = object.email.toLowerCase();
        }

        async save() {
            return new Promise((resolve,reject)=>{
                this.exists().then((result)=>{
                    if(result === false) {
                        this._insert().then(()=>{
                            resolve(true);
                        }).catch((e)=>{
                            reject(e);
                        });
                    }
                    else {
                        this.ID = result;
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
                db.query("INSERT INTO users (username, email) VALUES (?,?)",
                    [this.username, this.email], (err, result) => {
                        if(err) return reject(err);
                        console.log("Risultato insert user");
                        console.log(result);
                        this.ID = result.insertId;
                        resolve(true);
                    });
            });
        }

        async _update() {
            return new Promise((resolve,reject) => {
                db.query("UPDATE users SET username = ?, email = ? WHERE ID = ?",
                    [this.username, this.email, this.ID], (err) => {
                        if(err) return reject(err);
                        resolve(true);
                    });
            });

        }

        static async query(parameter,userToIgnore) {
            return new Promise((resolve,reject) => {
                db.query("SELECT * FROM users WHERE (username LIKE ? OR email " +
                    "LIKE ?) AND username <> ? ORDER BY username ASC, email ASC",
                    [parameter+"%", parameter+"%", userToIgnore.username],
                    (err,result) => {
                        if(err) return reject(err);
                        let users = [];
                        for(let i=0;i<result.length;i++)
                            users.push(
                                new User(
                                    result[0].ID,
                                    result[0].username,
                                    result[0].email
                                )
                            );
                        resolve(users);
                    });
            });
        }
    }
};