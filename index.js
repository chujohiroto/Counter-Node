const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

//SQL系のSetting
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
});

db.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('connected as id ' + db.threadId);
});

db.query('use db', function (error) {
    if (error) {
        console.log(error);
    }
});

db.query('CREATE TABLE IF NOT EXISTS counter(id TEXT, count INT)',
    function (error) {
        if (error) {
            console.log(error);
        }
    });

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
    db.query('REPLACE INTO counter VALUES(?,?) ON DUPLICATE KEY UPDATE id  = ? ,count = ?', [id, count, id, count],
        function (error) {
            if (error) {
                console.log(error);
                return;
            }
            console.log("Save id:" + id + " count:" + count);
        });
});

app.post("/load", function (req, res) {
    const id = req.body.id;
    var json = [];
    console.log("Load Request id:" + id);
    db.query('SELECT DISTINCT * FROM counter WHERE id =?', [id], function (error, row) {
        if (error) {
            throw error;
        }
        json.push(row[0]);
        res.json(json);
        /*row.forEach(element => {
            json.push(element);
            console.log(json);
            res.json(json);
        });*/
    })
});

const PORT = process.env.PORT || 8085;

app.listen(PORT, function () {
    console.log("Node.js is listening to PORT:" + PORT);
});
