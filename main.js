'use strict';

import 'dotenv/config';
import models from './src/models/bundle';
import app from './src/app';
import mongoose from 'mongoose';

const http = require('http');

app.set('port', process.env.PORT);

const server = http.createServer(app);

//Connect to the MongoDB database; then start the server
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => server.listen(process.env.PORT))
  .catch((err) => {
    console.log('Error connecting to the database', err.message);
    process.exit(err.statusCode);
  });

server.on('listening', () => {
  console.log(`Machbarschaft app listening on port ${process.env.PORT}.`);
});

server.on('error', (err) => {
  console.log('Error in the server', err.message);
  process.exit(err.statusCode);
});
