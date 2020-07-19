import Router from 'express';
import Validator from './../validator';
import passport from 'passport';
import DashboardController from './../controllers/dashboard-controller';

const router = Router();

/**
 * @swagger
 * /dashboard/active-requests:
 *   get:
 *     summary: Get active requests
 *     description: Returns all active requests of the authenticated user.
 *     tags:
 *       - dashboard
 *     responses:
 *       200:
 *         description: returned active requests successfully
 *         content:
 *          application/json:
 *              schema:
 *                  type: address
 *              example:
 *                helpSeeker: []
 *                helper:
 *                  _id: '5f14732f59ff6da9386ee0d3'
 *                  process: '5f14732f59ff6da9386ee0d4'
 *                  status: 'accepted'
 *                  urgency: 'today'
 *                  extras:
 *                    carNecessary: false
 *                    prescriptionRequired: false
 *                    _id: '5f14732f59ff6da9386ee0d5'
 *                  address:
 *                    _id: '5f14732f59ff6da9386ee0d6'
 *                    street: 'Boltzmannstraße'
 *                    zipCode: 85748
 *                    city: 'Garching bei München'
 *                    country: 'Germany'
 *                  startedAt: '2020-07-19T17:26:23.269Z'
 *                  name: 'Max Mustermann'
 *       401:
 *         description: not authorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/active-requests',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  DashboardController.getActiveRequests
);

/**
 * @swagger
 * /dashboard/finished-requests:
 *   get:
 *     summary: Get finished requests
 *     description: Returns all finished requests of the authenticated user.
 *     tags:
 *       - dashboard
 *     responses:
 *       200:
 *         description: returned finished requests successfully
 *       401:
 *         description: not authorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/finished-requests',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  DashboardController.getFinishedRequests
);

export default router;
