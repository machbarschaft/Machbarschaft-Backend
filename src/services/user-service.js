import models from '../models/bundle';
import AddressService from './address-service';
import APIError from '../errors';

export default class UserService {
  static async createUser(countryCode, phone, profile) {
    let user = await models.User.findOne({
      countryCode: countryCode,
      phone: phone,
    });
    if (user) {
      return new Promise.reject(
        new APIError(
          400,
          'Es gibt bereits einen Benutzer mit dieser Telefonnummer.'
        )
      );
    }
    user = new models.User({
      countryCode: countryCode,
      phone: phone,
      preferences: new models.UserPreferences(),
      profile: profile,
    });
    return user.save();
  }

  static async findUserByPhone(countryCode, phone) {
    return models.User.findOne({ countryCode: countryCode, phone: phone });
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
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Benutzer mit der gegebenen ID.')
      );
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
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Benutzer mit der gegebenen ID.')
      );
    }
    return {
      radius: user.preferences.radius,
      notifyNearbyRequests: user.preferences.notifyNearbyRequests,
      useGps: user.preferences.useGps,
      staticPosition: user.preferences.staticPosition
        ? await AddressService.prepareAddressResponse(
            await models.Address.findById(user.preferences.staticPosition)
          )
        : null,
    };
  }
}
