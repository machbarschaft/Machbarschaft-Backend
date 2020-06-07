"use strict";

const express = require('express');
const router = express.Router();
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var Access = require('../models/access');
const config = require('../config');
var jwt = require('jsonwebtoken');
var JwtCookieComboStrategy = require('passport-jwt-cookiecombo');


// Authenticate API calls with the Cookie Combo Strategy

passport.use(new JwtCookieComboStrategy({
    secretOrPublicKey: config.jwt.secret,
    jwtVerifyOptions: config.jwt.options,
    passReqToCallback: false
}, (payload, done) => {
    return done(null, payload.user, {});
}));

// check if user with given email already exists

router.post('/checkEmail', (req, res) => Access.findOne({email: req.body.email}, function(err, user){
    if(err) { return res.status(401).send('an error occured while searching for the user') }
    if(user) { res.status(401).send('user already exists') }
    else {
        res.status(200).send();
        console.log(jwt);
    } }));

// Registration procedure

router.post('/register', (req, res) => { 
    Access.register(new Access({ email : req.body.email }), req.body.password, function(err) {
    if (err) {
        return res.status(400).send();
    } });
    res.status(200).send();
});


// Login procedure

router.post('/login', passport.authenticate('local', {
    session: false
}), (req, res) => {

    // Create and sign json web token with the user as payload
    jwt.sign({
        uid: req.user._id
    }, config.jwt.secret, config.jwt.options, (err, token) => {
        // error handling at JWT signing
        if (err) return res.status(500).json(err);

        // Send the Set-Cookie header with the jwt to the client
        res.cookie('jwt', token, config.jwt.cookie);

        // Send status 200 to client
        res.status(200).send();
    });
});

// Authentication procedure

/*router.use('/authenticate', passport.authenticate('jwt-cookiecombo', {
    session: false
}), function(req, res) {
    console.log(req);
    res.status(200).send();
});*/

// Logout procedure

router.get('/logout', (req, res) => {
    req.logout();
    res.status(200).send('Log out successful!');
});

module.exports = router;