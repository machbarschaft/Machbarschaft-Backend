"use strict";
var passport = require('passport');
var Access = require('../models/access');
const config = require('../config');
var jwt = require('jsonwebtoken');
var JwtCookieComboStrategy = require('passport-jwt-cookiecombo');

/*const register = function(req, res) {
    Access.register(new Access({ email : req.body.email }), req.body.password, function(err) {
        if (err) {
            return console.log('error')
        }

        passport.authenticate('local', {session: false});
                // Create and sign json web token with the user as payload
    jwt.sign({
        email: req.body.email
    }, config.jwt.secret, config.jwt.options, (err, token) => {
        if (err) return res.status(500).json(err);

        // Send the Set-Cookie header with the jwt to the client
        res.cookie('jwt', token, config.jwt.cookie);

        // Response json with the jwt
        
        });
    });
});
return res.json({
    jwt: 'NA'
});
});*/


const register = function(req, res) {

    Access.register(new Access({ email : req.body.email }), req.body.password, function(err) {
        if (err) {
            return console.log('error');
        } }, 

        passport.authenticate('local')(req, res, function () {
            res = generateToken(req.body.email);
        });
    });


}}


router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

function generateToken(givenemail) {
    jwt.sign({
        email: givenemail
    }, config.jwt.secret, config.jwt.options, (err, token) => {
        if (err) return res.status(500).json(err);
        var res = String;
        // Send the Set-Cookie header with the jwt to the client
        res.cookie('jwt', token, config.jwt.cookie);

        // Response json with the jwt
        return res.json({
            jwt: token
        });
    });
}



const login = (req, res) => {
        passport.authenticate('local', {
        session: false, failureFlash: true
    }),
    jwt.sign({
        email: req.body.email
    }, config.jwt.secret, config.jwt.options, (err, token) => {
        if (err) return res.status(500).json(err);
        res.cookie('jwt', token, config.jwt.cookie);
        console.log(res.cookie);
        // Response json with the jwt
        return res.status(200).json({
            jwt: token
        });
    }

)

}



/*passport.authenticate('local', {
    session: false, failureRedirect: '/login'
})) */



const logout = (req, res) => {
    req.logout();
    res.status(200).send('Log out successful!');
};



/*passport.authenticate('jwt-cookiecombo', {
        session: false
    }), (req, res, next) => {
        return next();
    });
}*/



module.exports = {
    login,
    register,
    logout,
};