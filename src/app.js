'use strict';

import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import routes from './routes';
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const accessModel = require('./models/access');
const auth = require('./routes/auth');
const config = require('./config');
const JwtCookieComboStrategy = require('passport-jwt-cookiecombo');

const app = express();

//all application-wide middlewares
app.use(helmet()); //enforcing some security best practices, e.g. https connection, prevent clickjacking ..
app.use(cors()); //Cross-Origin Resource Sharing, restrict access between web applications

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(config.jwt.secret));

// Authenticate API calls with the Cookie Combo Strategy
passport.use(
  new JwtCookieComboStrategy(
    {
      secretOrPublicKey: config.jwt.secret,
      jwtVerifyOptions: config.jwt.options,
      passReqToCallback: false,
    },
    (payload, done) => {
      return done(null, payload.user, {});
    }
  )
);

// use static authenticate method of model in LocalStrategy
passport.use(
  new LocalStrategy({ usernameField: 'email' }, accessModel.authenticate())
);

//all routes
app.use('/', routes.landingPage);
app.use('/auth', auth);

module.exports = app;
