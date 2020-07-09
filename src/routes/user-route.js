'use strict';

import Router from 'express';
import UserController from './../controllers/user-controller';
import Validator from './../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /user/profile:
 *  put:
 *      summary: Update profile
 *      description: Set new values for forename and surname in your profile.
 *      tags:
 *          - user-profile
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          forename:
 *                              type: String
 *                          surname:
 *                              type: String
 *                  example:
 *                      forename: John
 *                      surname: Smith
 *      responses:
 *          200:
 *              description: Successfully updated profile.
 *          404:
 *              description: Could not find user with given id.
 *          500:
 *              description: Internal server error
 */
router.put(
  '/profile',
  Validator.cookieValidationRules('jwt'),
  Validator.nameValidationRules('forename'),
  Validator.nameValidationRules('surname'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  UserController.updateProfile
);

export default router;
