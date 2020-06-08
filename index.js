"use strict";
const mongoose = require('mongoose');
const http = require('http');
const config = require('./src/jwt_config');
const api = require('./src/api');

// Set the port to the API.
api.set('port', config.port);

//Create a http server based on Express
const server = http.createServer(api);

//Deploy nodejs application on port 3000
//app.listen(3000, function () {
//    console.log('Machbarschaft app listening on port 3000!');
//});

//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI)
    .then(() => server.listen(config.port, function () {
     	console.log('Machbarschaft app listening on port 3000!');
		}))
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });

server.on('listening', () => {
        console.log(`API is running in port ${config.port}`);
    });

server.on('error', (err) => {
        console.log('Error in the server', err.message);
        process.exit(err.statusCode);
    });
