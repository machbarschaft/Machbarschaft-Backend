'use strict';

import models from '../models/bundle';
import UserService from './user-service';

export default class ConfirmPhoneService {
  static async create(userId, phone, sms) {
    const user = await UserService.findUserById(userId);
    if (!user) {
      return Promise.reject('No user found with the given id.');
    }

    const recentConfirmPhone = await ConfirmPhoneService.getMostRecentConfirmPhone(
      userId
    );
    let tan;
    if (!recentConfirmPhone || recentConfirmPhone.successful === true) {
      tan = Math.floor(Math.random() * 9999);
    } else {
      tan = recentConfirmPhone.tan;
    }
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
    return ConfirmPhoneService.getMostRecentConfirmPhone(userId).then(
      async (confirmPhone) => {
        if (confirmPhone.expiresAt.getTime() < Date.now()) {
          return Promise.reject(new Error('This tan is expired.'));
        }
        if (confirmPhone.tan !== tan) {
          return Promise.reject(new Error('The tan is incorrect.'));
        }
        confirmPhone.successful = true;
        confirmPhone.save();
        let user = await models.User.findOne({ _id: userId });
        user.phoneVerified = true;
        user.save();
        return; //ToDo return cookie
      }
    );
  }

  static async getMostRecentConfirmPhone(userId) {
    let sortedEntries = await models.ConfirmPhone.find({ user: userId }).sort({
      createdAt: -1,
    });
    if (!sortedEntries) {
      return Promise.reject(
        new Error('There was no tan generated for the given user.')
      );
    }
    return sortedEntries[0];
  }
}
