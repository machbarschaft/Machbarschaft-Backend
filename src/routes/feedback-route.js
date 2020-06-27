'use strict';

import Router from 'express';
import FeedbackController from './../controllers/feedback-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

router.get(
  '/',
  Validator.idValidationRules('sdf'),
  Validator.cookieValidationRules(),
  Validator.validate,
  (req, res) => {
    res.status(200).send('Hallo freut mich dass es geklappt hat.');
  }
);

router.post(
  '/:type/:id',
  Validator.idValidationRules('id'),
  Validator.cookieValidationRules(),
  Validator.processFeedbackValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  FeedbackController.createFeedback
);

export default router;
