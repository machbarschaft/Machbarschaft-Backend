'use strict';
// =============================================================================
// Dependencies
// =============================================================================
var JwtCookieComboStrategy = require('passport-jwt-cookiecombo');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

// =============================================================================
// Strong secret to sign the token
// =============================================================================
var secret = 'StRoNGs3crE7';

// =============================================================================
// Init passport jwt cookie combo strategy
// =============================================================================
passport.use(new JwtCookieComboStrategy({
    secretOrPublicKey: secret,
    jwtCookieName: 'jwt'
}, (payload, done) => {
    return done(null, payload.user);
}));

// =============================================================================
// After login (e.g. with any other passport strategy), we have a user...
// =============================================================================
var fakeUser = {
    id: '577839eeddde013794ae2332',
    role: 'admin'
};

// =============================================================================
//  ...to store in the payload of the token
// =============================================================================
var jsonWebToken = jwt.sign({
    user: fakeUser
}, secret);

// =============================================================================
// Store the token in an httpOnly secure signed cookie and...
// =============================================================================
console.log(cookieParser('jwt', jsonWebToken, {httpOnly: true, secure: true, signed: true}));

// =============================================================================
// ...or use it in the authorization header of your requests
// =============================================================================
// $.ajax({ headers: { Authorization: jsonWebToken } });

// =============================================================================
// Token Info
// =============================================================================
console.info(jsonWebToken);

// =============================================================================
//  auth cookie request
// =============================================================================
var reqCookie = {
    signedCookies: {
        jwt: jsonWebToken
    }
};

// =============================================================================
//  auth header request
// =============================================================================
var reqHeader = {
    headers: {
        authorization: jsonWebToken
    },
    get: function(key) {
        return this.headers[key];
    }
};

// =============================================================================
// Response and Next params
// =============================================================================
var res = {};
var next = err => {
    console.warn(err);
};

// =============================================================================
//  jwt from cookie route protection, e.g. /api/v1/users
// =============================================================================
passport.authenticate('jwt-cookiecombo', (err, user, info) => {
    if (err) return console.warn(err);
    
    user.from = 'cookie';
    console.log(user);

})(reqCookie, res, next);

// =============================================================================
//  jwt from header route protection, e.g. /api/v1/users
// =============================================================================
passport.authenticate('jwt-cookiecombo', (err, user, info) => {
    if (err) return console.warn(err);
    
    user.from = 'header';
    console.log(user);

})(reqHeader, res, next);

var progress = 'Run passport jwt cookie combo authentications';

