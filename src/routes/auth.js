'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


const JWTConfig = require('../jwt_config');
const AccessModel = require('../models/access');

// check if user with given email already exists

router.post('/checkEmail', (req, res) =>
    AccessModel.findOne({
        email: req.body.email
    }, function (err, user) {
        if (err) {
            console.error(err);
            return res.status(400).send();
        }
        if (user) {
            return res.status(401).send();
        } else {
            console.log(jwt);
            return res.status(200).send();
        }
    })
);

// Registration procedure

router.post('/register', (req, res) => {
    AccessModel.register(
        new AccessModel({
            email: req.body.email
        }),
        req.body.password,
        function (err) {
            if (err) {
                console.error(err);
                return res.status(400).send();
            }
        }
    );
    return res.status(200).send();
});

// Login procedure

router.post(
    '/login',
    passport.authenticate('local', {
        session: false,
    }),
    (req, res) => {
        // Create and sign json web token with the user as payload
        jwt.sign(
            {
                user: {
                    uid: req.user._id,
                },
            },
            JWTConfig.jwtSecret(),
            JWTConfig.jwtOptions(JWTConfig.AuthenticationType.login),
            (err, token) => {
                // error handling at JWT signing
                if (err) {
                    console.error(err);
                    return res.status(500).json(err);
                }

                // Send the Set-Cookie header with the jwt to the client
                res.cookie('jwt', token, JWTConfig.jwtCookie(JWTConfig.AuthenticationType.login));

                // Send status 200 to client
                return res.status(200).send();
            }
        );
    }
);

// Authentication procedure

router.post(
    '/authenticate',
    passport.authenticate('jwt-cookiecombo', {
        session: false,
    }),
    (req, res) => {
        AccessModel.findOne({_id: req.user.uid}, function (err, user) {
            if (err) {
                console.error(err);
                return res.status(401).send();
            }
            if (user) {
                return res
                    .status(200)
                    .json({
                        uid: user._id,
                        email: user.email
                    });
            }
        });
    }
);

// Logout procedure, doesn't do anything for now as our authentication is cookie based
router.post(
    '/logout',
    passport.authenticate('jwt-cookiecombo', {
        session: false,
    }),
    (req, res) => {
        AccessModel.findOne({_id: req.user.uid}, function (err, user) {
            if (err) {
                console.error(err);
                return res.status(401).send();
            }
            if (user) {
                jwt.sign(
                    {
                        user: {
                            uid: req.user._id,
                        },
                    },
                    JWTConfig.jwtSecret(),
                    JWTConfig.jwtOptions(JWTConfig.AuthenticationType.logout),
                    (err, token) => {
                        // error handling at JWT signing
                        if (err) {
                            console.error(err);
                            return res.status(500).json(err);
                        }

                        // Send the Set-Cookie header with the jwt to the client
                        res.cookie('jwt', token, JWTConfig.jwtCookie(JWTConfig.AuthenticationType.logout));

                        // Send status 200 to client
                        return res.status(200).send();
                    }
                );
            }
        });
    }
);

module.exports = router;
