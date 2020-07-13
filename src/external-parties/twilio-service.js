'use strict';

import TwilioConfig from '../twilio_config';

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

export default class TwilioService {
  static sendTan(sendSms, tan, user, phone) {
    const name = user.profile.forename ? user.profile.forename : 'Gast';
    if (sendSms === 'true') {
      return twilio.messages.create({
        body:
          TwilioConfig.twilio.message_1 +
          name +
          TwilioConfig.twilio.message_2 +
          tan +
          TwilioConfig.twilio.message_4,
        from: TwilioConfig.twilio.phone_number_sms,
        to: TwilioConfig.twilio.country + phone.toString(),
      });
    } else {
      let string =
        TwilioConfig.twilio.message_5 +
        TwilioConfig.twilio.message_1 +
        name +
        TwilioConfig.twilio.message_2;
      let code = '';
      for (let i = 0; i < tan.toString().length; i++) {
        code += tan.toString()[i] + ', ';
      }
      string += code;
      string += TwilioConfig.twilio.message_3;
      string += code;
      string += TwilioConfig.twilio.message_4;
      const response = new VoiceResponse();
      response.pause({
        length: 3,
      });
      response.say(
        {
          voice: TwilioConfig.twilio.voice,
          language: TwilioConfig.twilio.voice_language,
        },
        string
      );
      return twilio.calls.create({
        twiml: response.toString(),
        to: TwilioConfig.twilio.country + phone.toString(),
        from: TwilioConfig.twilio.phone_number_call,
      });
    }
  }
}
