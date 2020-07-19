import Router from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import AuthController from '../controllers/auth-controller';
import Validator from '../validator.js';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register user account
 *     description: Register user account with identifier phone, email and password after checking if user exists.
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
 *               countryCode:
 *                 type: Number
 *               phone:
 *                 type: Number
 *               profile:
 *                 type: object
 *                 properties:
 *                   forename:
 *                      type: String
 *                   surname:
 *                      type: String
 *     responses:
 *       422:
 *         description: Request is not valid
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       401:
 *         description: Error occured while registration, check if phone or email is already assigned to an account
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       500:
 *         description: Registration failed
 *       201:
 *         description: Registration was successful
 */

router.post(
  '/register',
  Validator.phoneValidationRules(),
  Validator.userValidationRules(),
  Validator.nameValidationRules('forename'),
  Validator.nameValidationRules('surname'),
  Validator.validate,
  AuthController.register
);

/**
 * @swagger
 * /auth/login:
 *   put:
 *     summary: Login user account
 *     description: Login user account with identifier email and password.
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
 *         description: The phone number must be verified before logging in
 *       422:
 *         description: Request is not valid
 *         schema:
 *           type: object
 *           properties:
 *             errors:
 *               type: array
 *       500:
 *         description: Authentication failed
 *       200:
 *         description: Login was successful
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
 *     summary: Authenticate user
 *     description: Identify user by providing his JWT cookie.
 *     tags:
 *       - auth
 *     responses:
 *       500:
 *         description: Authentication failed
 *       200:
 *         description: Authentication was successful
 *         schema:
 *           type: object
 *           properties:
 *             uid:
 *               type: String
 *             email:
 *               type: String
 *             phoneNumber:
 *               type: Number
 *             emailVerified:
 *               type: Boolean
 *             phoneVerified:
 *               type: Boolean
 *             profile:
 *               type: object
 *               properties:
 *                  forename:
 *                      type: String
 *                  surname:
 *                      type: String
 *             address:
 *               type: object
 *               properties:
 *                  street:
 *                      type: String
 *                  houseNumber:
 *                      type: Number
 *                  zipCode:
 *                      type: Number
 *                  city:
 *                      type: String
 *                  country:
 *                      type: String
 *
 */

router.get(
  '/authenticate',
  Validator.cookieValidationRules('jwt'),
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
 *     description: Logout user by changing the cookie.
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
 *         description: Logout was successful
 */
router.put(
  '/logout',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  AuthController.logout
);

/**
 * @swagger
 * /auth/resendEmail:
 *   get:
 *     summary: Resend Email confirmation, change email address
 *     description: Trigger to resend email confirmation or change email address itself.
 *     tags:
 *       - auth
 *     responses:
 *       500:
 *         description: Email sending failed
 *       200:
 *         description: Resend was successful
 */
router.get(
  '/resendEmail',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  AuthController.resendEmail
);

/**
 * @swagger
 * /auth/verify/{token}:
 *   get:
 *     summary: Verify Email token
 *     description: Verify email token and set user to verified if true.
 *     tags:
 *       - auth
 *     responses:
 *       401:
 *         description: Wrong token
 *       200:
 *         description: Verification successful
 *       500:
 *         description: Internal server error
 */

router.get('/verify/:token', AuthController.verify);

/**
 * @swagger
 * /auth/sendResetPassword:
 *   get:
 *     summary: Send reset password email
 *     description: Send reset password email for user.
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
 *     responses:
 *       500:
 *         description: Email sending failed
 *       200:
 *         description: Successful
 */

router.get(
  '/sendResetPassword/',
  [
    body(
      'email',
      'Die E-Mail-Adresse muss im E-Mail-Format angegeben werden.'
    ).isEmail(),
  ],
  Validator.validate,
  AuthController.sendResetPassword
);

/**
 * @swagger
 * /auth/verifyResetPassword/{token}:
 *   get:
 *     summary: Verify reset password token
 *     description: Verify if reset password token is correct.
 *     tags:
 *       - auth
 *     responses:
 *       401:
 *         description: Wrong token
 *       200:
 *         description: Verification successful
 *       500:
 *         description: Internal server error
 */

router.get('/verifyResetPassword/:token', AuthController.verifyResetPassword);

/**
 * @swagger
 * /auth/resetPassword/{token}:
 *   get:
 *     summary: Reset password
 *     description: Change to new password of user in backend.
 *     tags:
 *       - auth
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       500:
 *         description: Internal server error
 *       401:
 *         description: Wrong token
 *       200:
 *         description: Passwort change successful
 */

router.get(
  '/resetPassword/:token',
  [
    body(
      'password',
      'Das Passwort muss mindestens 5 Zeichen lang sein.'
    ).isLength({ min: 5 }),
  ],
  Validator.validate,
  AuthController.resetPassword
);

/**
 * @swagger
 * /auth/changePassword:
 *   get:
 *     summary: Change password
 *     description: Change to new password of user in backend.
 *     tags:
 *       - auth
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password change was successful
 *       401:
 *         description: Wrong password
 *       404:
 *         description: Not found
 *       500:
 *         description: Internal server error
 */

router.get(
  '/changePassword/',
  Validator.cookieValidationRules('jwt'),
  [
    body(
      'oldPassword',
      'Das Passwort muss mindestens 5 Zeichen lang sein.'
    ).isLength({ min: 5 }),
    body(
      'newPassword',
      'Das Passwort muss mindestens 5 Zeichen lang sein.'
    ).isLength({ min: 5 }),
  ],
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  AuthController.changePassword
);

export default router;
