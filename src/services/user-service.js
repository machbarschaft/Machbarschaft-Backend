'use strict';

import models from '../models/bundle';
import PhoneService from './phone-service';
import AddressService from './address-service';

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

  static async setPreferences(userId, processBody) {
    const user = await models.User.findById(userId);
    if (!user) {
      return Promise.reject(new Error('No user with given id.'));
    }
    if (processBody.radius) {
      user.preferences.radius = processBody.radius;
    }
    if (processBody.notifyNearbyRequests) {
      user.preferences.notifyNearbyRequests = processBody.notifyNearbyRequests;
    }
    if (processBody.useGps) {
      user.preferences.useGps = processBody.useGps;
    }
    if (
      processBody.houseNumber &&
      processBody.zipCode &&
      processBody.street &&
      processBody.city &&
      processBody.country
    ) {
      user.preferences.staticPosition = await AddressService.createAddress(
        processBody.street,
        processBody.houseNumber,
        processBody.zipCode,
        processBody.city,
        processBody.country
      );
    }
    return user.save();
  }

  static async getPreferences(userId) {
    const user = await models.User.findById(userId);
    if (!user) {
      return Promise.reject(new Error('No user with given id.'));
    }
    return {
      radius: user.preferences.radius,
      notifyNearbyRequests: user.preferences.notifyNearbyRequests,
      useGps: user.preferences.notifyNearbyRequests,
      staticPosition: user.preferences.staticPosition
        ? await AddressService.prepareAddressResponse(
            await models.Address.findById(user.preferences.staticPosition)
          )
        : null,
    };
  }
}
