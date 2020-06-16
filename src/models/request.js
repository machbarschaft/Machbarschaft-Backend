'use strict';
import mongoose from 'mongoose';

const requestTypes = ['groceries', 'medication', 'other'];
const urgencyCategories = ['now', 'today', 'tomorrow', 'this-week'];
const statusStages = ['open', 'accepted', 'done', 'replaced', 'aborted'];

const requestExtrasSchema = new mongoose.Schema({
  carNecessary: {
    type: Boolean,
    default: true,
  },
  prescriptionRequired: {
    type: Boolean,
    default: true,
  },
});

const requestSchema = new mongoose.Schema(
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
    requestType: {
      type: String,
      enum: requestTypes,
      required: true,
    },
    urgency: {
      type: String,
      enum: urgencyCategories,
      required: true,
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
