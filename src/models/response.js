import mongoose from 'mongoose';

const statusStages = [
  'accepted',
  'called',
  'on-the-way',
  'done',
  'aborted',
  'did-not-help',
];

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: statusStages,
      required: true,
    },
    log: {
      type: Map,
      of: Date,
    },
  },
  { timestamps: true }
);

const Response = mongoose.model('Response', responseSchema);

export default Response;
