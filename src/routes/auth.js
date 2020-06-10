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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user account
 *     description: Register user account with identifier email and password after checking if user exists
 *     tags:
 *       - auth
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       422:
 *         description: request is not valid
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       401:
 *         description: error occured while registration, checking if user already exists or user already exists
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       200:
 *         description: registration was successful
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
        return res.status(401).send({ errors: 'error occured' });
      }
      if (access) {
        return res.status(401).send({ errors: 'user already exists' });
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
        return res.status(401).send({ errors: 'error while registering' });
      }
      if (access) {
        return res.status(200).send();
      }
    }
  );
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user account
 *     description: Login user account with identifier email and password
 *     tags:
 *       - auth
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       422:
 *         description: request is not valid
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       500:
 *         description: authentication failed
 *       200:
 *         description: registration was successful
 *         headers:
 *          Set-Cookie:
 *            schema:
 *              type: string
 *              example: jwt=s%3AeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVpZCI6IjVlZGUzZTFjMzlmYTlhN2RmZDgzNTYxNCJ9LCJpYXQiOjE1OTE3MjE5NTgsImV4cCI6MTU5NDMxMzk1OCwiYXVkIjoibG9jYWxob3N0IiwiaXNzIjoibG9jYWxob3N0In0.E5MMF0rCmTyB4fe-JSfg3gozphYPApDmQfYn9DYJ2QQ.OfONHJ9UDgAhPzH1MFtUjFWAsDz8Q7fJ0CQidrApckA; Expires=Thu, 09 Jul 2020 16:59:18 GMT; Path=/; HttpOnly; SameSite=Strict; Domain=localhost
 */

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

/**
 * @swagger
 * /auth/authenticate:
 *   post:
 *     summary: authenticate user
 *     description: identify user by by providing his jwt cookie
 *     tags:
 *       - auth
 *     responses:
 *       401:
 *         description: authentication failed
 *       200:
 *         description: authentication was successful
 *         schema:
 *           type: object
 *           properties:
 *             uid:
 *               type: string
 *             email:
 *               type: string
 */

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

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user by changing the cookie
 *     tags:
 *       - auth
 *     responses:
 *       401:
 *         description: couldn't find user in database
 *       500:
 *         description: JWT signing failed
 *         schema:
 *          type: object
 *          properties:
 *            err:
 *            type: array
 *       200:
 *         description: registration was successful
 */
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
