import mongoose from 'mongoose';

//import all models
import Access from './access-model';
import Address from './address-model';
import BearerToken from './bearer-token-model';
import ConfirmEmail from './confirm-email-model';
import ConfirmPhone from './confirm-phone-model';
import ContactForm from './contact-form-model';
import { ProcessFeedback, AudioFeedback, FormFeedback } from './feedback-model';
import MobileToken from './mobile-token-model';
import { Request, RequestExtras } from './request-model';
import ResetPassword from './reset-password-model';
import { Response } from './response-model';
import { User, UserProfile, UserPreferences } from './user-model';
import Process from './process-model';
import { Example } from './example-model';

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
  RequestExtras,
  ResetPassword,
  Response,
  User,
  UserProfile,
  UserPreferences,
  Process,
  Example,
};

export default models;
