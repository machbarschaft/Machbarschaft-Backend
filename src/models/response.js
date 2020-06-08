import mongoose from 'mongoose';

const statusStages = ['accepted', 'called', 'on-the-way', 'done'];

const responseSchema = new mongoose.Schema(
  {
    process: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Process',
      required: true,
    },
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
  },
  { timestamps: true }
);

const Response = mongoose.model('Response', responseSchema);

export default Response;
