import mongoose from 'mongoose';

const requestTypes = ['groceries', 'medication', 'other'];
const urgencyCategories = ['now', 'today', 'tomorrow', 'this-week'];
const statusStages = ['creating‚', 'open', 'accepted', 'done'];

const requestExtrasSchema = new mongoose.Schema({
  carNecessary: {
    type: Boolean,
    default: false,
  },
  prescriptionRequired: {
    type: Boolean,
    default: false,
  },
});

const requestSchema = new mongoose.Schema(
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
      default: statusStages[0],
    },
    requestType: {
      type: String,
      enum: requestTypes,
    },
    urgency: {
      type: String,
      enum: urgencyCategories,
    },
    extras: requestExtrasSchema,
    privacyAgreed: Boolean,
    raw: String,
    locale: String,
    log: {
      type: Map,
      of: Date,
    },
  },
  { timestamps: true }
);

const RequestExtras = mongoose.model('RequestExtras', requestExtrasSchema);
const Request = mongoose.model('Request', requestSchema);

export {
  Request,
  RequestExtras,
  statusStages,
  urgencyCategories,
  requestTypes,
};
