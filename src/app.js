'use strict';

import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import routes from './routes';
import path from 'path';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import passport from 'passport';
import accessModel from './models/access';
import JwtCookieComboStrategy from 'passport-jwt-cookiecombo';
import JWTConfig from './jwt_config';

const LocalStrategy = require('passport-local').Strategy;

const app = express();

//all application-wide middlewares
app.use(helmet()); //enforcing some security best practices, e.g. https connection, prevent clickjacking ..
app.use(cors()); //Cross-Origin Resource Sharing, restrict access between web applications

app.use(cookieParser(JWTConfig.jwtSecret()));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// Authenticate API calls with the Cookie Combo Strategy
passport.use(
  new JwtCookieComboStrategy(
    {
      secretOrPublicKey: JWTConfig.jwtSecret(),
      jwtVerifyOptions: JWTConfig.jwtOptions(),
      passReqToCallback: false,
    },
    (payload, done) => {
      return done(null, payload.user, {});
    }
  )
);

// use static authenticate method of model in LocalStrategy
passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    accessModel.authenticate()
  )
);

//all routes
app.use('/', routes.landingPage);
app.use('/auth', routes.auth);

module.exports = app;
