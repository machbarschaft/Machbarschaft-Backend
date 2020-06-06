"use strict";
var express    = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Access = require('./models/access');
var auth  = require('./routes/auth');
var api = express();
const config = require('./config');


api.use(bodyParser.urlencoded({ extended: false }));
api.use(bodyParser.json());
api.use(cookieParser());
api.use(passport.initialize());
api.use(passport.session());
api.use(express.static(path.join(__dirname, 'public')));
api.use(cookieParser(config.jwt.secret));

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy({ usernameField: 'email' }, Access.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(Access.serializeUser());
passport.deserializeUser(Access.deserializeUser());



// Basic route
api.get('/', (req, res) => {
    res.send('HALLO')
   // res.json({
   //    name: 'Machbarschaft'
   // });
});

// API routes
api.use('/auth', auth);

module.exports = api;
