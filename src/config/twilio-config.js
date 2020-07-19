const twilio = {
  // Twilio verification call gender of voice
  voice: 'woman',
  // language of voice
  voice_language: 'de-DE',
  // Twilio phone number to be used for SMS verification
  phone_number_sms: '+441315105863',
  // Twilio phone number to be used for phone verification
  phone_number_call: '+4940299960804',
  // text for SMS and phone verification
  message_1: 'Hallo ',
  message_2: ', dein Code lautet: ',
  message_3: '. Ich wiederhole: ',
  message_4: '. Deine Machbarschaft',
};
module.exports = {
  twilio,
};
