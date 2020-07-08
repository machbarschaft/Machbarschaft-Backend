'use strict';

import Router from 'express';
import FeedbackController from './../controllers/feedback-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /feedback/{type}/{id}:
 *   post:
 *     summary: Create process feedback
 *     description: Give feedback regarding a certain request/response.
 *     tags:
 *       - feedback
 *     parameters:
 *      - in: path
 *        name: type
 *        type: String
 *        required: true
 *      - in: path
 *        name: id
 *        type: ObjectId
 *        required: true
 *     responses:
 *       201:
 *         description: Successfully save feedback.
 *       401:
 *          description: Unauthorized to give feedback for this request/response.
 *       404:
 *          description: Request not found OR Response not found
 *       500:
 *          description: Internal server error
 */
router.post(
  '/:type/:id',
  Validator.idValidationRules('id'),
  Validator.cookieValidationRules('jwt'),
  Validator.processFeedbackValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  FeedbackController.createFeedback
);

export default router;
