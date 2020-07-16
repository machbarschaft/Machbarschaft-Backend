import mongoose from 'mongoose';

const confirmPhoneSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    countryCode: {
      type: Number,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    tan: {
      type: Number,
      required: true,
    },
    sms: {
      type: Boolean,
      default: false,
    },
    successful: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const ConfirmPhone = mongoose.model('ConfirmPhone', confirmPhoneSchema);

export default ConfirmPhone;
