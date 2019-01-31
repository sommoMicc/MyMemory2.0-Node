var express = require('express');
var messages = require("../model/communications/message");
var mailer = require("../model/communications/mailer");

var router = express.Router();

module.exports = (dbConnection) => {
    const User = require("../model/db/user")(dbConnection.connection);
    const Token = require("../model/db/token")(dbConnection.connection);
    const LetsMemoryMailer = new mailer();

    /* GET home page. */
    router.get('/login', (req, res) => {
        res.send("TODO!")
    });

    router.post('/signup', async (req, res) => {
        console.log(req.body);
        let email = req.body.email;
        if(email == null || email.trim().length === 0) {
            res.send(messages.error("Inserire una email valida"));
            return;
        }
        email = email.trim();

        let username = req.body.username;
        if(username == null || username.trim().length === 0) {
            res.send(messages.error("Inserire uno username valido"));
            return;
        }
        username = username.trim();

        let newUser = new User(null,username,email);
        if(await newUser.usernameExists()) {
            res.send(messages.error("Lo username esiste già"));
            return;
        }
        if(await newUser.emailExists()) {
            res.send(messages.error("L'email è già registrata. Prova ad effettuare" +
                "il login con quella"));
            return;
        }

        if(!newUser.save()) {
            res.send(messages.error("Si è verificato un problema tecnico nella " +
                "registrazione. Per favore riprova più tardi."));
            return;
        }

        let token = await Token.generate(newUser);
        if(!token) {
            res.send(messages.error("Si è verificato un problema tecnico nella " +
                "registrazione 2. Per favore riprova più tardi."));
            return;
        }
        console.log(token);

        LetsMemoryMailer.sendSignupMail(newUser.email,token.value,(e,r)=>{
            if(e) {
                res.send(messages.error("Si è verificato un problema tecnico nella " +
                    "registrazione 3. Per favore riprova più tardi."));
            }
            else {
                res.send(messages.success("Per completare la registrazione, controlla" +
                    "la tua posta in arrivo e apri il link."));

            }
        });
    });

    router.get('/', function(req, res) {
        res.send("FORBIDDEN!")
    });
    return router;
};