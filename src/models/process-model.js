import mongoose from 'mongoose';

const processSchema = new mongoose.Schema(
  {
    finishedAt: Date,
    requests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request',
        default: [],
      },
    ],
    response: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Response',
        default: [],
      },
    ],
    feedback: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProcessFeedback',
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Process = new mongoose.model('Process', processSchema);

export default Process;
