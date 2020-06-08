import mongoose from 'mongoose';

const processFeedbackSchema = new mongoose.Schema(
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
    needContact: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true, discriminatorKey: 'kind' }
);

const ProcessFeedback = mongoose.model(
  'ProcessFeedback',
  processFeedbackSchema
);

const AudioFeedback = ProcessFeedback.discriminator(
  'AudioFeedback',
  {
    duration: {
      type: Number, //in ms
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  { discriminatorKey: 'kind' }
);

const FormFeedback = ProcessFeedback.discriminator(
  'FormFeedback',
  {
    comment: {
      type: String,
      required: true,
    },
  },
  { discriminatorKey: 'kind' }
);

export { ProcessFeedback, AudioFeedback, FormFeedback };
