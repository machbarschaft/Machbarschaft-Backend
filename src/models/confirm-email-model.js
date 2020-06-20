import mongoose from 'mongoose';

const confirmEmailSchema = new mongoose.Schema(
  {
    access: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Access',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

const ConfirmEmail = mongoose.model('ConfirmEmail', confirmEmailSchema);

export default ConfirmEmail;
