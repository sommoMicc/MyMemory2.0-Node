const express = require('express');
const router = express.Router();

module.exports = (dbConnection) => {
    const User = require("../model/user")(dbConnection.connection);

    /* GET users listing. */
    router.get('/get/:id/', function(req, res) {
        let user = new User(req.params.id);
        user.load().then(()=>{
            delete user.password;
            res.json({
                status: "success",
                user: user
            });
        }).catch((e) => {
            res.json({
                status: "error",
                message: e
            });
        });
    });

    router.get("/", function(req,res) {
        res.status(404).send("Not found");
    });

    router.put("/", function(req, res) {

        console.log(req.body);
        let user = new User(null,req.body.username);
        user.setPlainPassword(req.body.password).then(()=> {
          user.save().then((result)=>{
               if(result) res.send({
                   status: "success"
               });

          }).catch(()=>{
              res.send({
                  status: "error",
                  message: ""
              });
          });
        }).catch((e) => {
            res.send({
                status: "error",
                message: e
            });
        });
    });

    return router;
};
