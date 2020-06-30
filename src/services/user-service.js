'use strict';

import models from '../models/bundle';
import ConfirmPhoneService from './confirm-phone-service';

export default class UserService {
  static async createUser(phone) {
    let user = await models.User.findOne({
      phone: phone,
    });
    if (user) {
      return new Promise((resolve, reject) => {
        reject('User already exists');
      });
    }
    user = new models.User({
      phone: phone,
      preferences: new models.UserPreferences(),
    });
    return user.save().then((user) => {
      ConfirmPhoneService.create(user._id, user.phone, false);
      return Promise.resolve(user);
    });
  }

  static async findUserByPhone(phone) {
    return models.User.findOne({ phone: phone });
  }

  static async findUserById(userId) {
    return models.User.findOne({ _id: userId });
  }

  static async isVerified(userId) {
    const user = await this.findUserById(userId);
    if (user && user.phoneVerified === true) {
      return true;
    }
    return false;
  }
  static async emailVerified(userId) {
    const user = await this.findUserById(userId);
    const access = await models.Access.findById(user.access);
    if (access && access.EmailVerified === true) {
      return true;
    }
    return false;
  }
}
