var express = require('express');
var messages = require("./model/communications/message");
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");
var morgan = require('morgan');

const DatabaseConnection = require("./model/db/databaseConnection");
const dbConnection = new DatabaseConnection();

var indexRouter = require('./routes/index');

var app = express();
var http = require("http").Server(app);
require("./websocket")(http,dbConnection);


app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('static'));

dbConnection.connect().then((a,b) => {
    if(!a || b) {
        console.log("Errore di connessione al database");
        process.exit(1);
    }
    else {
        app.use('/', indexRouter(dbConnection));
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            res.status(500).send(messages.error(err));
        })
    }
}).catch((a)=> {
    console.log("Errore di connessione al database");
    console.log(a);
    process.exit(0);
});
http.listen(3000,()=>{
    console.log("Server in ascolto sulla porta 3000");
});
module.exports = app;
