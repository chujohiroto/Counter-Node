const express = require('express');
const bodyParser = require('body-parser');
//const mysql = require('mysql');
var sqlite = require('sqlite3').verbose();
require('dotenv').config();

//SQL系のSetting
/*const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
});*/

var db = new sqlite.Database('count.sqlite');

//express系のSetting
var app = express();
app.use(bodyParser.json());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", function (req, res) {
    res.send("Root");
});

app.post("/save", function (req, res) {
    const id = req.body.id;
    const count = req.body.count;
    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS counter(id TEXT, count INT)');
        var stmt = db.prepare('INSERT INTO counter VALUES(?,?)');
        stmt.run([id, count]);
        stmt.finalize();
    });
});

app.post("/load", function (req, res) {
    const id = req.body.id;
    var json = [];

    db.serialize(function () {
        db.run('CREATE TABLE IF NOT EXISTS counter(id TEXT, count INT)');
        db.each("SELECT * counter WHERE id =?", [id], function (err, row) {
            results.forEach(element => {
                json.push(element.count);
            });
            res.json(json);
        });
    });
});

const PORT = process.env.PORT || 8085;

app.listen(PORT, function () {
    console.log("Node.js is listening to PORT:" + PORT);
});
