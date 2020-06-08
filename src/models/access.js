'use strict';

import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const accessSchema = new mongoose.Schema({
  email: String,
  password: String,
});

accessSchema.plugin(passportLocalMongoose, { usernameField: 'email' });

module.exports = mongoose.model('accessModel', accessSchema, 'Access');
