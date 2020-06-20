'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import Address from './address-model';

const accessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  email: String,
  password: String,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  bearerToken: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BearerToken',
  },
  resetPassword: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResetPassword',
    },
  ],
  confirmEmail: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConfirmEmail',
    },
  ],
});

accessSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  passwordField: 'password',
});

const Access = mongoose.model('Access', accessSchema);
export default Access;
