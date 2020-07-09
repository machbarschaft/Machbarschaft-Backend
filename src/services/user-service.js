'use strict';

import models from '../models/bundle';
import PhoneService from './phone-service';

export default class UserService {
  static async createUser(phone, profile) {
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
      profile: profile,
    });
    return user.save().then((user) => {
      PhoneService.create(user._id, user.phone, false);
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

  static async updateProfile(userId, forename, surname) {
    const user = await this.findUserById(userId);
    if (!user) {
      return Promise.reject('Could not find user with given id.');
    }
    user.profile = { forename: forename, surname: surname };
    return user.save();
  }
}
