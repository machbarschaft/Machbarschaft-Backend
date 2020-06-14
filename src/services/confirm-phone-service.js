'use strict';

import models from '../models/bundle';

export default class ConfirmPhoneService {
  static async create(userId, phone, sms) {
    const tan = Math.floor(Math.random() * 9999);
    const confirmPhone = new models.ConfirmPhone({
      user: userId,
      phone: phone,
      tan: tan,
      sms: sms,
    });
    confirmPhone.save();
    //ToDo: initiate Twilio verification call/sms
    return confirmPhone._id;
  }

  static async confirm(tan, userId) {
    let newestEntry = await models.ConfirmPhone.find({ user: userId }).sort({
      createdAt: -1,
    });
    if (newestEntry.expiresAt < Date.now) {
      return Promise.reject(new Error('Expired'));
    }
    if (newestEntry.tan !== tan) {
      return Promise.reject(new Error('Incorrect Tan'));
    }
    newestEntry.successful = true;
    newestEntry.save();
    let user = await models.User.findOne({ _id: userId });
    user.phoneVerified = true;
    user.save();
    //ToDo return cookie
  }
}
