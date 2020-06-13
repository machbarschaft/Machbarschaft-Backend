import mongoose from 'mongoose';

const statusStages = ['accepted', 'called', 'on-the-way', 'done', 'aborted'];

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
  },
  { timestamps: true }
);

const Response = mongoose.model('Response', responseSchema);

export default Response;
