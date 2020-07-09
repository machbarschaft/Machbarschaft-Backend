'use strict';

import Router from 'express';
import RequestController from './../controllers/request-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /request/{reqId}:
 *   put:
 *     summary: Update the request
 *     description: Update the request specified by the 'reqId'.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          name:
 *                              type: String
 *                              required: false
 *                          addressId:
 *                              type: ObjectId
 *                              required: false
 *                          requestType:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - groceries
 *                                  - medication
 *                                  - other
 *                          urgency:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - now
 *                                  - today
 *                                  - tomorrow
 *                                  - this-week
 *                          prescriptionRequired:
 *                              type: Boolean
 *                              required: false
 *                          carNecessary:
 *                              type: Boolean
 *                              required: false
 *     responses:
 *       200:
 *         description: Successfully updated request.
 *         schema:
 *           type: request
 *       400:
 *          description: Request is already published.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.updateLoggedIn
);

export default router;
