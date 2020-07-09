'use strict';

import models from '../models/bundle';
import UserService from './user-service';
import TwilioConfig from '../twilio_config';

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

export default class PhoneService {
  static async create(userId, phone, sms) {
    const user = await UserService.findUserById(userId);
    if (!user) {
      return Promise.reject('No user found with the given id.');
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
      phone: phone,
      tan: tan,
      sms: sms,
    });
    user.confirmPhone.push(confirmPhone._id);
    user.save();
    confirmPhone.save();
    if (sms === 'true') {
      twilio.messages.create({
        body:
          TwilioConfig.twilio.message_1 +
          user.profile.name +
          TwilioConfig.twilio.message_2 +
          tan +
          TwilioConfig.twilio.message_4,
        from: TwilioConfig.twilio.phone_number_sms,
        to: TwilioConfig.twilio.country + phone.toString(),
      });
    } else {
      var string =
        TwilioConfig.twilio.message_5 +
        TwilioConfig.twilio.message_1 +
        user.profile.name +
        TwilioConfig.twilio.message_2;
      var code = '';
      for (var i = 0; i < tan.toString().length; i++) {
        code += tan.toString()[i] + ', ';
      }
      string += code;
      string += TwilioConfig.twilio.message_3;
      string += code;
      string += TwilioConfig.twilio.message_4;
      const response = new VoiceResponse();
      response.say(
        {
          voice: TwilioConfig.twilio.voice,
          language: TwilioConfig.twilio.voice_language,
        },
        string
      );
      twilio.calls.create({
        twiml: response.toString(),
        to: TwilioConfig.twilio.country + phone.toString(),
        from: TwilioConfig.twilio.phone_number_call,
      });
    }
    return;
  }

  static async confirm(tan, userId) {
    return PhoneService.getMostRecentConfirmPhone(userId).then(
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
        if (user.phone.toString() !== confirmPhone.phone.toString()) {
          user.phone = confirmPhone.phone;
        }
        user.save();
        return Promise.resolve(user.phone.toString());
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
