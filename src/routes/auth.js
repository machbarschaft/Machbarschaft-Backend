"use strict";

const express = require('express');
const router = express.Router();
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var Access = require('../models/access');
const config = require('../config');
var jwt = require('jsonwebtoken');


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
        'user': {
        uid: req.user._id }
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

router.post('/authenticate', passport.authenticate('jwt-cookiecombo', {
    session: false
}), (req, res) => {
    Access.findOne({_id: req.user.uid}, function(err, user){
        if(err) { return res.status(401).send('didnt find user') }
        if(user) { res.status(200).send('user id: ' + user._id + ', user mail address: ' + user.email) }
    }); 
});

        
// Logout procedure, doesn't do anything for now as our authentication is cookie based

router.get('/logout', (req, res) => {
    req.logout();
    res.status(200).send('Log out successful!');
});

module.exports = router;