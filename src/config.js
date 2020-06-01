"use strict";

// Configuration variables
const port      = process.env.PORT        || '3000';
const mongoURI  = process.env.MONGODB_URI || 'mongodb://localhost:27017/machbarschaft';

module.exports = {
    port,
    mongoURI,
};
