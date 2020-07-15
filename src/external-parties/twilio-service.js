'use strict';

import TwilioConfig from '../twilio_config';

const twilio = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const VoiceResponse = require('twilio').twiml.VoiceResponse;

export default class TwilioService {
  static sendTan(sendSms, tan, user, phone) {
    let tanString = tan.toString();
    while (tanString.length < 4) {
      tanString = '0' + tanString;
    }
    const name = user.profile.forename ? user.profile.forename : 'Gast';
    if (sendSms === 'true') {
      return twilio.messages.create({
        body:
          TwilioConfig.twilio.message_1 +
          name +
          TwilioConfig.twilio.message_2 +
          tanString +
          TwilioConfig.twilio.message_4,
        from: TwilioConfig.twilio.phone_number_sms,
        to: TwilioConfig.twilio.country + phone.toString(),
      });
    } else {
      let phoneCallScript =
        TwilioConfig.twilio.message_5 +
        TwilioConfig.twilio.message_1 +
        name +
        TwilioConfig.twilio.message_2;
      let code = '';
      for (let i = 0; i < tanString.length; i++) {
        code += tanString[i] + ', ';
      }
      phoneCallScript += code;
      phoneCallScript += TwilioConfig.twilio.message_3;
      phoneCallScript += code;
      phoneCallScript += TwilioConfig.twilio.message_4;
      const response = new VoiceResponse();
      response.pause({
        length: 3,
      });
      response.say(
        {
          voice: TwilioConfig.twilio.voice,
          language: TwilioConfig.twilio.voice_language,
        },
        phoneCallScript
      );
      return twilio.calls.create({
        twiml: response.toString(),
        to: TwilioConfig.twilio.country + phone.toString(),
        from: TwilioConfig.twilio.phone_number_call,
      });
    }
  }
}
