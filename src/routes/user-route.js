'use strict';

import Router from 'express';
import UserController from './../controllers/user-controller';
import Validator from './../validator';
import passport from 'passport';

const router = Router();

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
