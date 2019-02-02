var express = require('express');
var messages = require("../model/communications/message");
var mailer = require("../model/communications/mailer");

var router = express.Router();
var config = require("../config");

module.exports = (dbConnection) => {
    const User = require("../model/db/user")(dbConnection.connection);
    const Token = require("../model/db/token")(dbConnection.connection);
    const LetsMemoryMailer = new mailer();

    /* GET home page. */
    router.get('/login', (req, res) => {
        res.send("TODO!")
    });

    router.post('/signup', async (req, res) => {
        try{
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
                res.send(messages.error("Lo username esiste già."));
                return;
            }
            if(await newUser.emailExists()) {
                res.send(messages.error("L'email è già registrata. Prova ad effettuare" +
                    "il login con quella."));
                return;
            }

            if(!await newUser.save()) {
                res.send(messages.error("Si è verificato un problema tecnico nella " +
                    "registrazione. Per favore riprova più tardi."));
                return;
            }
            const platform = req.body.platform.trim().toUpperCase();

            let token = await Token.generate(newUser.ID);
            if(!token) {
                res.send(messages.error("Si è verificato un problema tecnico nella " +
                    "registrazione 2. Per favore riprova più tardi."));
                return;
            }
            LetsMemoryMailer.sendSignupMail(newUser.email,platform,token.value,(e,r)=>{
                if(e) {
                    res.send(messages.error("Si è verificato un problema tecnico nella " +
                        "registrazione 3. Per favore riprova più tardi."));
                }
                else {
                    res.send(messages.success("Per completare la registrazione, controlla" +
                        "la tua posta in arrivo e apri il link."));

                }
            });
        }
        catch(e) {
            console.log("Eccezione!");
            console.log(e);
            res.send(messages.error("Errore nella procedura di registrazione. Riprova più tardi."));
        }
    });

    router.post('/login', async function(req, res) {
        let email = req.body.email;
        if(email == null || email.trim().length === 0) {
            res.send(messages.error("Inserire un'email valida."));
            return;
        }
        //Controllo se esiste un utente associato a quella email
        let user = new User(null,null,email);
        let userID = await user.emailExists();

        if(!userID) {
            res.send(messages.error("Non esiste nessun account associato a questa email. Prova a registrarti."));
            return;
        }

        const platform = req.body.platform.trim().toUpperCase();

        //Carico l'utente dal database
        user.ID = userID;
        await user.load();

        //Faccio scadere tutti i token associati a quell'utente
        await Token.cleanTokens(user.ID);
        //Creo un nuovo token per l'utente
        let token = await Token.generate(user.ID);
        if(!token) {
            res.send(messages.error("Si è verificato un problema tecnico nel " +
                "login. Per favore riprova più tardi."));
            return;
        }

        LetsMemoryMailer.sendLoginMail(user.email,platform,token.value,(e,r)=>{
            if(e) {
                res.send(messages.error("Si è verificato un problema tecnico nel " +
                    "login 2. Per favore riprova più tardi."));
            }
            else {
                res.send(messages.success("Per completare il login, controlla" +
                    "la tua posta in arrivo e apri il link."));

            }
        });

    });

    router.post('/finishLogin', async function(req, res) {
        let tokenValue = req.body.token;
        if(tokenValue == null || tokenValue.trim().length === 0) {
            res.send(messages.error("Token non presente."));
            return;
        }
        tokenValue = tokenValue.trim();
        let token = new Token(tokenValue);
        if(!await token.isValid()) {
            res.send(messages.error("Token non valido o scaduto."));
            return;
        }
        //Ricreo un nuovo token "definitivo"
        await token.load();
        let user = await token.getUser();
        //Pulisco tutti i vecchi token e ne ricreo un altro
        await Token.cleanTokens(user.ID);
        token = await Token.generate(user.ID);

        if(!token) {
            res.send(messages.error("Errore nella ricreazione del token."));
            return;
        }

        const response = messages.success("Login completato",{
            username: user.username,
            token: token.value
        });

        res.send(response);
    });

    router.get("/.well-known/assetlinks.json",(req,res)=>{
        res.send([{
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.micheletagliabue.letsmemory",
                sha256_cert_fingerprints: [config.SHA256_ANDRID_CERT]
            }
        }]);
    });

    router.get("/.well-known/apple-app-site-association",(req,res)=>{
       res.send({
           "applinks": {
               "apps": [],
               "details": [
                   {
                       "appID": "ABCD1234.com.micheletagliabue.letsmemory",
                       "paths": [ "*" ]
                   }
               ]
           }
       });
    });

    return router;
};