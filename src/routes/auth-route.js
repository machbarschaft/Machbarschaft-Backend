'use strict';

import Router from 'express';
import AuthController from './../controllers/auth-controller';
import passport from 'passport';
import Validator from '../validator.js';
const router = Router();

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
 *         description: error occured while registration, check if phone or email is already assigned to an account.
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       500:
 *         description: internal server error
 *       201:
 *         description: registration was successful
 */

router.post(
  '/register',
  Validator.phoneValidationRules(),
  Validator.userValidationRules(),
  Validator.validate,
  AuthController.register
);

/**
 * @swagger
 * /auth/login:
 *   put:
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
 *       403:
 *         description: The phone number must be verified before logging in.
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

router.put(
  '/login',
  Validator.userValidationRules(),
  Validator.validate,
  passport.authenticate('local', {
    session: false,
  }),
  AuthController.login
);

/**
 * @swagger
 * /auth/authenticate:
 *   get:
 *     summary: authenticate user
 *     description: identify user by by providing his jwt cookie
 *     tags:
 *       - auth
 *     responses:
 *       500:
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

router.get(
  '/authenticate',
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  AuthController.authenticate
);

/**
 * @swagger
 * /auth/logout:
 *   put:
 *     summary: Logout user
 *     description: Logout user by changing the cookie
 *     tags:
 *       - auth
 *     responses:
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
router.put(
  '/logout',
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  AuthController.logout
);

export default router;
