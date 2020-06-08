import mongoose from 'mongoose';

const mobileTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deviceIdentifier: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

const MobileToken = mongoose.model('MobileToken', mobileTokenSchema);

export default MobileToken;
