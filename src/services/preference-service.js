'use strict';

import models from '../models/bundle';
import AddressService from './address-service';

export default class PreferenceService {
  static async setPreferences(userId, processBody) {
    const user = await models.User.findById(userId);
    if (!user) {
      return Promise.reject(new Error('No user with given id.'));
    }
    if(processBody.radius) {
      user.preferences.radius = processBody.radius;
    }
    if(processBody.notifyNearbyRequests) {
      user.preferences.notifyNearbyRequests = processBody.notifyNearbyRequests;
    }
    if(processBody.useGps) {
      user.preferences.useGps = processBody.useGps;
    }
    if(processBody.houseNumber && processBody.zipCode && processBody.street && processBody.city && processBody.country) {
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
      staticPosition: await AddressService.prepareAddressResponse(await models.Address.findById(user.preferences.staticPosition))
    };
  }
}
