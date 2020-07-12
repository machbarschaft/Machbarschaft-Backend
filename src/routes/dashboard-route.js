'use strict';

import Router from 'express';
import Validator from './../validator';
import passport from 'passport';
import DashboardController from './../controllers/dashboard-controller';

const router = Router();

/**
 * @swagger
 * /dashboard/helpseeker/active-requests:
 *   get:
 *     summary: Get active requests
 *     description: Returns all active requests of the authenticated user.
 *     tags:
 *       - dashboard
 *     responses:
 *       200:
 *         description: returned active requests successfully
 *       401:
 *         description: not authorized
 *       500:
 *         description: Internal server error
 */
router.get(
  '/helpseeker/active-requests',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  DashboardController.getActiveRequestsHelpseeker
);

/**
 * @swagger
 * /dashboard/helpseeker/finished-requests:
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
  '/helpseeker/finished-requests',
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  DashboardController.getFinishedRequestsHelpseeker
);

export default router;
