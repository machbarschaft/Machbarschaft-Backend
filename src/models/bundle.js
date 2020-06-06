import mongoose from 'mongoose';

//import all models
import Access from './access';
import Address from './address';
import BearerToken from './bearer-token';
import ConfirmEmail from './confirm-email';
import ConfirmPhone from './confirm-phone';
import ContactForm from './contact-form';
import { ProcessFeedback, AudioFeedback, FormFeedback } from './feedback';
import MobileToken from './mobile-token';
import Request from './request';
import ResetPassword from './reset-password';
import Response from './response';
import User from './user';

mongoose.set('useNewUrlParser', true);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

const models = {
  Access,
  Address,
  BearerToken,
  ConfirmEmail,
  ConfirmPhone,
  ContactForm,
  ProcessFeedback,
  AudioFeedback,
  FormFeedback,
  MobileToken,
  Request,
  ResetPassword,
  Response,
  User,
};

export default models;
