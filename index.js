const mongoose = require('mongoose');
const http = require('http');
const config = require('./src/config');
var express = require('express');
var app = express();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

//Deploy nodejs application on port 3000
//app.listen(3000, function () {
//    console.log('Machbarschaft app listening on port 3000!');
//});

//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI)
    .then(() => app.listen(config.port, function () {
     	console.log('Machbarschaft app listening on port 3000!');
		}))
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });
