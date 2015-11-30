var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');

app.get('/', function (req, res) {
    res.sendfile('./index.html');
});

http.listen(3000);

// Communication with clients and database
io.on('connection', function (socket) {
    socket.on('toServer', function (data) {
        add_data(data, function () {
            get_data(function (param) {
                socket.emit('toClient', param);
            });
        });
    });
});

// Insert data from clients
function add_data(data, callback) {
    db.query("insert into sweetslist (type,qty) values (?,?)",
        [data.type, data.qty], function (err, res) {
            callback(res);
        });
}

// get data
function get_data(callback) {
    db.query("select * from sweetslist", function (err, rows) {
        console.log(rows);
        callback(rows);
    });
}


// DB connection
var HOST = 'localhost';
var PORT = 8889;
var MYSQL_USERNAME = 'root';
var MYSQL_PASSWORD = 'root';

var db = mysql.createConnection({
    host: HOST,
    port: PORT,
    user: MYSQL_USERNAME,
    password: MYSQL_PASSWORD,
});

// Create and fill sample database
// destroy old db
db.query('DROP DATABASE IF EXISTS db_test', function (err) {
    if (err) console.log("Probably no connection to database");
});

// create database
db.query('CREATE DATABASE IF NOT EXISTS db_test', function (err) {
    if (err) console.log("Could not create a new database");
});

// Use this database 
db.query('USE db_test');

// create table
var query_createTable =
        "create table IF NOT EXISTS sweetslist(" +
        "   id int unsigned not null auto_increment," +
        "   type varchar(20) not null," +
        "   qty smallint not null default 0," +
        "   primary key (id)" +
        ");";
db.query(query_createTable, function (err) {
    if (err) console.log("Could not create a new table");
});

// Fill table 
db.query("insert into sweetslist (type,qty)" +
         "values ('Chocolate',2),('Bonbons',18);");










