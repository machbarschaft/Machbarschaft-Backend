'use strict';

import models from '../models/bundle';
import ConfirmPhone from '../models/confirm-phone';

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
      user.confirmPhone = ConfirmPhone.create(user._id);
    });
  }
}
