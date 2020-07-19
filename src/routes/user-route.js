import Router from 'express';
import passport from 'passport';
import UserController from '../controllers/user-controller';
import Validator from '../validator';

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

/**
 * @swagger
 * /user/preferences:
 *   get:
 *     summary: Get preferences
 *     description: Preferences includes position of user and radius in which the user wants to be notified
 *     tags:
 *       - user-preferences
 *     responses:
 *       200:
 *         description: returned user preferences successfully
 *       401:
 *         description: not authorized
 *       500:
 *         description: Internal server error
 */

router.get(
  '/preferences',
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  UserController.getPreferences
);

/**
 * @swagger
 * /user/preferences:
 *   put:
 *     summary: Set preference of user
 *     description: Set the preferences of the user including position of user and radius in which the user wants to be notified
 *     tags:
 *       - user-preferences
 *     requestBody:
 *       content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          radius:
 *                              type: Number
 *                              required: false
 *                          notifyNearbyRequests:
 *                              type: Boolean
 *                              required: false
 *                          useGps:
 *                              type: Boolean
 *                              required: false
 *                          street:
 *                              type: String
 *                              required: false
 *                          houseNumber:
 *                              type: Number
 *                              required: false
 *                          zipCode:
 *                              type: Number
 *                              required: false
 *                          city:
 *                              type: String
 *                              required: false
 *                          country:
 *                              type: String
 *                              required: false
 *     responses:
 *       200:
 *         description: Update of preferences was successful
 *       400:
 *         description: Unable to validate exact address
 *       500:
 *         description: Internal server error
 */

router.put(
  '/preferences',
  Validator.cookieValidationRules(),
  Validator.preferencesValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  UserController.setPreferences
);

export default router;
