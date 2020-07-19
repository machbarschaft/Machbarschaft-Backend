import models from '../models/bundle';
import UserService from './user-service';
import TwilioService from '../external-parties/twilio-service';
import APIError from '../errors';

export default class PhoneService {
  static async create(userId, countryCode, phone, sms) {
    const user = await UserService.findUserById(userId);
    if (!user) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Benutzer mit der gegebenen ID.')
      );
    }
    const recentConfirmPhone = await PhoneService.getMostRecentConfirmPhone(
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
      countryCode,
      phone,
      tan,
      sms,
    });
    user.confirmPhone.push(confirmPhone._id);
    user.save();
    confirmPhone.save();
    return TwilioService.sendTan(sms, tan, user, countryCode, phone);
  }

  static async confirm(tan, userId) {
    return PhoneService.getMostRecentConfirmPhone(userId).then(
      async (confirmPhone) => {
        if (confirmPhone.expiresAt.getTime() < Date.now()) {
          return Promise.reject(
            new APIError(400, 'Die Gültigkeit des Tans ist abgelaufen.')
          );
        }

        if (confirmPhone.tan !== tan) {
          return Promise.reject(new APIError(400, 'Der Tan ist ungültig.'));
        }
        confirmPhone.successful = true;
        confirmPhone.save();
        const user = await models.User.findOne({ _id: userId });
        user.phoneVerified = true;
        if (user.phone.toString() !== confirmPhone.phone.toString()) {
          user.phone = confirmPhone.phone;
        }
        user.save();
        return Promise.resolve(user.phone.toString());
      }
    );
  }

  static async getMostRecentConfirmPhone(userId) {
    const sortedEntries = await models.ConfirmPhone.find({ user: userId }).sort(
      {
        createdAt: -1,
      }
    );
    if (!sortedEntries) {
      return Promise.reject(
        new APIError(404, 'Für diesen Benutzer wurde kein Tan erstellt.')
      );
    }
    return sortedEntries[0];
  }
}
