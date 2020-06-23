import mongoose from 'mongoose';

const bearerTokenSchema = new mongoose.Schema(
  {
    access: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Access',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    invalidatedAt: Date,
    expiresAt: {
      type: Date,
      default: new Date(Date.now + (24 + 60 * 60 * 1000)),
    },
  },
  { timestamps: true }
);

const BearerToken = mongoose.model('BearerToken', bearerTokenSchema);

export default BearerToken;
