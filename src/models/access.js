'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

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

module.exports = mongoose.model('accessModel', accessSchema, 'Access');
