import mongoose from 'mongoose';

const resetPasswordSchema = new mongoose.Schema({
  access: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Access',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  processCompleted: {
    type: Boolean,
    default: false,
  },
});

const ResetPassword = mongoose.model('ResetPassword', resetPasswordSchema);

export default ResetPassword;
