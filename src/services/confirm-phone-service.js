'use strict';

import models from '../models/bundle';
import UserService from './user-service';

export default class ConfirmPhoneService {
  static async create(userId, phone, sms) {
    const user = await UserService.findUserById(userId);
    if (!user) {
      return Promise.reject('No user found with the given id.');
    }
    const tan = Math.floor(Math.random() * 9999);
    const confirmPhone = new models.ConfirmPhone({
      user: userId,
      phone: phone,
      tan: tan,
      sms: sms,
    });
    user.confirmPhone.push(confirmPhone._id);
    user.save();
    confirmPhone.save();
    //ToDo: initiate Twilio verification call/sms
    return;
  }

  static async confirm(tan, userId) {
    let sortedEntries = await models.ConfirmPhone.find({ user: userId }).sort({
      createdAt: -1,
    });
    if (!sortedEntries) {
      return Promise.reject(
        new Error('There was no tan generated for the given user.')
      );
    }
    if (sortedEntries[0].expiresAt.getTime() < Date.now()) {
      return Promise.reject(new Error('This tan is expired.'));
    }
    if (sortedEntries[0].tan !== tan) {
      return Promise.reject(new Error('The tan is incorrect.'));
    }
    sortedEntries[0].successful = true;
    sortedEntries[0].save();
    let user = await models.User.findOne({ _id: userId });
    user.phoneVerified = true;
    user.save();
    return; //ToDo return cookie
  }
}
