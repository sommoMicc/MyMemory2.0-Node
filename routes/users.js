const express = require('express');
const router = express.Router();

module.exports = (dbConnection) => {
    const User = require("../../model/user")(dbConnection.connection);

    /* GET users listing. */
    router.get('/:id', function(req, res) {

        let user = new User(req.params.id);
        user.load().then(()=>{
            delete user.password;
            res.send(user);
        }).catch((e) => {
            res.send({
                status: "error",
                message: e
            });
        });
    });

    router.put("/", function(req, res) {
        /**
         * let user = new User(null,req.body.username);
         * user.setPlainPassword(req.body.password).then(()=> {
         *     user.save().then((result)=>{
         *          if(result) res.send({
         *              status: success
         *          });
         *
         *     }).catch(()=>{
         *         res.send({
         *             status:error
         *         })
         *     });
         * });
         *
         */
    });
};
