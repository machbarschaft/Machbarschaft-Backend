import Router from 'express';
import PreferenceController from './../controllers/preference-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /getpreferences:
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
  '/getpreferences',
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  PreferenceController.getPreferences
);

/**
 * @swagger
 * /setpreferences:
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
 *       500:
 *         description: Internal server error
 */

router.put(
  '/setpreferences',
  Validator.cookieValidationRules(),
  Validator.preferencesValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  PreferenceController.setPreferences
);

export default router;
