'use strict';

import models from '../models/bundle';

export default class PreferenceService {
  static async setPreferences(processBody) {
    const user = await models.User.findById(processBody.user.uid);
    if (!user) {
      return Promise.reject(new Error('No user with given id.'));
    }
    const preferences = user.preferences;
    if(preferences.radius) {
      preferences.radius = processBody.radius;
    }
    if(preferences.notifyNearbyRequests) {
      preferences.notifyNearbyRequests = processBody.notifyNearbyRequests;
    }
    if(preferences.useGps) {
      preferences.useGps = processBody.useGps;
    }
    if(preferences.staticPosition) {
      preferences.staticPosition = processBody.address;
    }
    return preferences.save();
  }

  static async getPreferences(userId) {
    const user = await models.User.findById(userId);
    if (!user) {
      return Promise.reject(new Error('No user with given id.'));
    }
    return user.preferences;
  }
}
