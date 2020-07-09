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
 *       - preference
 *     responses:
 *       200:
 *         description: status change was successful
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
 * /process/{processId}/response/abort:
 *   put:
 *     summary: Helper aborts a response
 *     description: The response will be marked as aborted in its status
 *     tags:
 *       - process
 *       - response
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: abortion was successful
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
