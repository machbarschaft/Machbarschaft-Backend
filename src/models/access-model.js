import mongoose from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

const accessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
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
      default: [],
    },
  ],
});

accessSchema.plugin(passportLocalMongoose, {
  usernameField: 'email',
  passwordField: 'password',
});

const Access = mongoose.model('Access', accessSchema);
export default Access;
