import Router from 'express';
import RequestController from './../controllers/request-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

router.post(
  '/guest',
  Validator.phoneValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  RequestController.createLoggedOut
);
router.post(
  '/',
  Validator.cookieValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.createLoggedIn
);
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
router.put(
  '/guest/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.phoneValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  RequestController.updateLoggedOut
);

router.put(
  '/publish/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.publishLoggedIn
);
//router.put('/guest/publish/:reqId', Validator.idValidationRules('reqId'), Validator.validate, RequestController.);

export default router;
