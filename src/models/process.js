import mongoose from 'mongoose';

const processSchema = new mongoose.Schema(
  {
    finishedAt: Date,
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
      },
    ],
    response: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response',
      },
    ],
    feedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcessFeedback',
      },
    ],
  },
  { timestamps: true }
);

const Process = new mongoose.model('Process', processSchema);

export default Process;
