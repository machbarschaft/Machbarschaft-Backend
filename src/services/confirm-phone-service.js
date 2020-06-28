'use strict';

import models from '../models/bundle';
import UserService from './user-service';
import TwilioConfig from '../twilio_config';

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

export default class ConfirmPhoneService {
  static async create(userId, phone, sms) {
    console.log(sms);
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
    console.log(sms);
    if (sms === 'true') {
      console.log(TwilioConfig.twilio.from);
      console.log(
        TwilioConfig.twilio.message_1 + tan + TwilioConfig.twilio.message_2
      );
      console.log(TwilioConfig.twilio.country + phone.toString().substring(1));

      twilio.messages
        .create({
          body:
            TwilioConfig.twilio.message_1 + tan + TwilioConfig.twilio.message_2,
          from: TwilioConfig.twilio.from,
          to: TwilioConfig.twilio.country + phone.toString().substring(1),
        })
        .then((message) => console.log(message.sid));
    } else {
      var string = TwilioConfig.twilio.message_1;
      console.log(tan);
      for (var i = 0; i < tan.toString().length; i++) {
        string += tan.toString()[i] + ', ';
      }
      string += TwilioConfig.twilio.message_2;
      const response = new VoiceResponse();
      response.say(
        {
          voice: TwilioConfig.twilio.voice,
          language: TwilioConfig.twilio.voice_language,
        },
        string
      );
      twilio.calls
        .create({
          twiml: response.toString(),
          to: TwilioConfig.twilio.country + phone.toString().substring(1),
          from: TwilioConfig.twilio.from,
        })
        .then((call) => console.log(call.sid));
    }
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
