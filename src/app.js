'use strict';

import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import routes from './routes';
//var express    = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var Access = require('./models/access');
var auth  = require('./routes/auth');
const config = require('./config');
var JwtCookieComboStrategy = require('passport-jwt-cookiecombo');
var jwt = require('jsonwebtoken');

const app = express();

//all application-wide middlewares
app.use(helmet()); //enforcing some security best practices, e.g. https connection, prevent clickjacking ..
app.use(cors()); //Cross-Origin Resource Sharing, restrict access between web applications

//all routes
app.use('/', routes.landingPage);
app.use('/', routes.landingPage);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//app.use(passport.initialize());
//app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(config.jwt.secret));

// Authenticate API calls with the Cookie Combo Strategy

passport.use(new JwtCookieComboStrategy({
    secretOrPublicKey: config.jwt.secret,
    jwtVerifyOptions: config.jwt.options,
    passReqToCallback: false,
}, (payload, done) => {
    return done(null, payload.user, {});
}));

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy({ usernameField: 'email' }, Access.authenticate()));

// use static serialize and deserialize of model for passport session support

passport.serializeUser(Access.serializeUser());
passport.deserializeUser(Access.deserializeUser());



// API routes
app.use('/auth', auth);

module.exports = app;
