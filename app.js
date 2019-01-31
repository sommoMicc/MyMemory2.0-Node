var express = require('express');
//var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");

const DatabaseConnection = require("./model/db/databaseConnection");
const dbConnection = new DatabaseConnection();

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

dbConnection.connect().then((a,b) => {
    if(!a || b) {
        console.log("Errore di connessione al database");
        process.exit(1);
    }
    else {
        app.use('/', indexRouter(dbConnection));
    }
}).catch((a)=> {
    console.log("Errore di connessione al database");
    console.log(a);
    process.exit(0);
});

module.exports = app;
