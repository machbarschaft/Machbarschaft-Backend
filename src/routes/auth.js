'use strict';

import Router from 'express';
import passport from 'passport';
import JWTConfig from '../jwt_config';
import AccessModel from '../models/access';
import jwt from 'jsonwebtoken';
import {
  userValidationRules,
  cookieValidationRules,
  validate,
} from '../validator.js';
const router = Router();
const { validationResult } = require('express-validator');
// Registration procedure

/**
 * @swagger
 * /add:
 *   post:
 *     summary: Add more animal
 *     description: Add animals to the list
 *     tags:
 *       - animals
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               animals:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Adds the animals in body
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               default: 'Added'
 */

router.post('/register', userValidationRules(), validate, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  AccessModel.findOne(
    {
      email: req.body.email,
    },
    function (err, access) {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      if (access) {
        return res.status(401).send();
      }
    }
  );
  AccessModel.register(
    new AccessModel({
      email: req.body.email,
    }),
    req.body.password,
    function (err, access) {
      if (err) {
        console.error(err);
        return res.status(400).send();
      }
      if (access) {
        return res.status(200).send();
      }
    }
  );
});

// Login procedure

router.post(
  '/login',
  userValidationRules(),
  validate,
  passport.authenticate('local', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
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
        res.cookie(
          'jwt',
          token,
          JWTConfig.jwtCookie(JWTConfig.AuthenticationType.login)
        );

        // Send status 200 to client
        return res.status(200).send();
      }
    );
  }
);

// Authentication procedure

router.post(
  '/authenticate',
  cookieValidationRules(),
  validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    AccessModel.findOne({ _id: req.user.uid }, function (err, user) {
      if (err) {
        console.error(err);
        return res.status(401).send();
      }
      if (user) {
        return res.status(200).json({
          uid: user._id,
          email: user.email,
        });
      }
    });
  }
);

// Logout procedure

router.post(
  '/logout',
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    AccessModel.findOne({ _id: req.user.uid }, function (err, user) {
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
            res.cookie(
              'jwt',
              token,
              JWTConfig.jwtCookie(JWTConfig.AuthenticationType.logout)
            );

            // Send status 200 to client
            return res.status(200).send();
          }
        );
      }
    });
  }
);
export default router;
