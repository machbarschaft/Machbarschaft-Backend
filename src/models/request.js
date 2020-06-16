'use strict';
import mongoose from 'mongoose';

const requestTypes = ['groceries', 'medication', 'other'];
const urgencyCategories = ['now', 'today', 'tomorrow', 'this-week'];
const statusStages = ['open', 'accepted', 'done', 'replaced', 'aborted'];

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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    status: {
      type: String,
      enum: statusStages,
      required: false,
    },
    requestType: {
      type: String,
      enum: requestTypes,
      required: false,
    },
    urgency: {
      type: String,
      enum: urgencyCategories,
      required: false,
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

const Request = mongoose.model('Request', requestSchema);

export default Request;
