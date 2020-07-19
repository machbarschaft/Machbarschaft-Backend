import mongoose from 'mongoose';

const requestTypes = ['groceries', 'medication', 'other'];
const urgencyCategories = ['now', 'today', 'tomorrow', 'this-week'];
const statusStages = [
  'creating',
  'open',
  'accepted',
  'done',
  'reopened',
  'aborted',
];

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
    feedbackSubmitted: {
      type: Boolean,
      default: false,
    },
    forename: String,
    surname: String,
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    requestType: {
      type: String,
      enum: requestTypes,
    },
    urgency: {
      type: String,
      enum: urgencyCategories,
    },
    extras: {
      type: requestExtrasSchema,
      required: true,
    },
    privacyAgreed: Boolean,
    raw: String,
    locale: String,
    log: {
      type: Map,
      of: Date,
      default: {},
    },
  },
  { timestamps: true }
);
requestSchema.virtual('name').get(function () {
  return this.forename + ' ' + this.surname;
});

const RequestExtras = mongoose.model('RequestExtras', requestExtrasSchema);
const Request = mongoose.model('Request', requestSchema);

export {
  Request,
  RequestExtras,
  statusStages,
  urgencyCategories,
  requestTypes,
};
