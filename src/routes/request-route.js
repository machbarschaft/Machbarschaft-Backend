import express from 'express';
import RequestController from './../controllers/request-controller';
import { cookieValidationRules, validate } from '../validator';
import passport from 'passport';

const router = express.Router();

router.post('/guest', RequestController.createLoggedOut);
router.post(
  '/',
  cookieValidationRules(),
  validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.createLoggedIn
);
router.put(
  '/:reqId',
  cookieValidationRules(),
  validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.updateLoggedIn
);
router.put('/guest/:reqId', RequestController.updateLoggedOut);

export default router;
