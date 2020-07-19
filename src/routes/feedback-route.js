import Router from 'express';
import passport from 'passport';
import FeedbackController from '../controllers/feedback-controller';
import Validator from '../validator';

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
 *         description: Successfully saved feedback
 *       401:
 *          description: Unauthorized to give feedback for this request/response
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

/**
 * @swagger
 * /feedback/{type}/{id}:
 *   post:
 *     summary: Get bool whether feedback exists
 *     description: Returns whether the authenticated user has already submitted feedback for the process with the given processId.
 *     tags:
 *       - feedback
 *     parameters:
 *      - in: query
 *        name: processId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Result if authenticated user submitted feedback for process
 *       500:
 *          description: Internal server error
 */
router.get(
  '/exists',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  FeedbackController.isFeedbackSubmitted
);

export default router;
