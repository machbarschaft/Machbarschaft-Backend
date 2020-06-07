"use strict";

// Configuration variables
const jwt = {
    secret: process.env.JWT_SECRET,
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
    jwt
};
