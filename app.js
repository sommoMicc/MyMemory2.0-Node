var express = require('express');
//var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require("body-parser");

const DatabaseConnection = require("./model/databaseConnection");
const dbConnection = new DatabaseConnection();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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
        app.use('/users/', usersRouter(dbConnection));
        app.use('/', indexRouter);
    }
});

module.exports = app;
