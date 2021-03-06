import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  radius: {
    type: Number,
    default: 3000,
  },
  notifyNearbyRequests: {
    type: Boolean,
    default: true,
  },
  useGps: {
    type: Boolean,
    default: false,
  },
  staticPosition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
});

const userProfileSchema = new mongoose.Schema({
  forename: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
});
userProfileSchema.virtual('name').get(function () {
  return `${this.forename} ${this.surname}`;
});

const userSchema = new mongoose.Schema({
  countryCode: {
    type: Number,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  confirmPhone: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConfirmPhone',
      default: [],
    },
  ],
  preferences: {
    type: userPreferencesSchema,
    required: true,
  },
  profile: {
    type: userProfileSchema,
  },
  access: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Access',
  },
  mobileTokens: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MobileToken',
    },
  ],
});

const UserPreferences = mongoose.model(
  'UserPreferences',
  userPreferencesSchema
);
const UserProfile = mongoose.model('UserProfile', userProfileSchema);
const User = mongoose.model('User', userSchema);

export { User, UserPreferences, UserProfile };
