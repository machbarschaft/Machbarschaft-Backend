"use strict";
var moment = require('moment');
var exp;

// Configuration variables
const port      = process.env.PORT        || '3000';
const mongoURI  = process.env.MONGODB_URI || 'mongodb://localhost:27017/machbarschaft';
const jwt = {
    secret: process.env.JWT_SECRET || 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAru//ki6E7T3jACIHGqwaV+gm5/ezGFUCqI7k/6Vdh7HvhOCGdL8hyEIUmOcwhYBgmkAFunuZSAq6wq8xk6QjwkHNya9nd+Nfv2/ynfqNgUNBOiYCoIVTTAYmee46tlvXBYrNYHDcPLe1PJTqL4ytgD+WmwE1oHkIZ6qDflHsh0/KnV/+0HZm6qLtW2uPaKqOfF/YitcSNBzlxrDSYBPEH4+FyWx+CGnyxldLhfiV986O6bnAHhOjX81/ASDyE4wsKRgziKR4gRReINblAeRjCwTVT2pCL623+JhrC1Of38U6aJ92zqKJxw5744YcZsSgiVse8O8wccjRsv+nRyMnZQIDAQAB',
    options: {
        audience: 'localhost',
        expiresIn: '30d', 
        issuer: 'localhost'
    },
    cookie: {
        httpOnly: true,
        sameSite: true,
        signed: true,
        secure: false,
        // see https://stackoverflow.com/questions/8842732/how-to-get-30-days-prior-to-current-date, could be changed but it works
        //expires: moment().add(30, 'days').format(), //new Date(new Date().setDate(new Date().getDate() + 30))
        expires: new Date(new Date().setDate(new Date().getDate() + 30))
    }
}

module.exports = {
    port,
    mongoURI,
    jwt
};
