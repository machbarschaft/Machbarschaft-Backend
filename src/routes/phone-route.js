import Router from 'express';
import PhoneController from '../controllers/phone-controller';
import Validator from '../validator';

const router = Router();

/**
 * @swagger
 * /phone/tan:
 *  put:
 *      summary: Confirm phone with tan
 *      description: Verify your phone by entering the tan send by Twilio to your phone.
 *      tags:
 *          - phone
 *      requestBody:
 *        content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                      countryCode:
 *                          type: Number
 *                      phone:
 *                          type: Number
 *                      tan:
 *                          type: Number
 */
router.put(
  '/tan',
  Validator.requireUserIdOrPhoneNumber(),
  Validator.tanValidationRules(),
  Validator.validate,
  PhoneController.confirmTan
);

/**
 * @swagger
 * /phone/tan:
 *  post:
 *      summary: Generate new tan.
 *      description: Generate a new tan and initiate Twilio call/sms. Can also be used for phone number change.
 *      tags:
 *          - phone
 *      requestBody:
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      countryCode:
 *                          type: Number
 *                      phone:
 *                          type: Number
 *                      sms:
 *                          type: Boolean
 *                  example:
 *                      countryCode: 49
 *                      phone: 8928901
 *                      sms: true
 */
router.post(
  '/tan',
  Validator.requireUserIdOrPhoneNumber(),
  Validator.smsValidationRules(),
  Validator.validate,
  PhoneController.createNewTan
);

/**
 * @swagger
 * /phone/findNumber:
 *  post:
 *      summary: Get number of help seeker.
 *      description: Twilio endpoint to get number of help seeker to redirect call at hotline.
 *      tags:
 *          - phone
 *      requestBody:
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      phone:
 *                          type: String
 *                      secret:
 *                          type: String
 *                  example:
 *                      phone: '+498928901'
 *                      secret: '0KNse9LOTX7luBy'
 */
router.post(
  '/findNumber',
  Validator.twilioValidationRules(),
  Validator.validate,
  PhoneController.findNumber
);

/**
 * @swagger
 * /phone/setCalled:
 *  post:
 *      summary: Update status of response as soon as helper has called.
 *      description: Twilio endpoint to update status of response as soon as helper has called.
 *      tags:
 *          - phone
 *      requestBody:
 *        content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      phone:
 *                          type: String
 *                      status:
 *                          type: String
 *                          enum: [completed, busy, no-answer, failed]
 *                      secret:
 *                          type: String
 *                  example:
 *                      phone: '+498928901'
 *                      status: 'completed'
 *                      secret: '0KNse9LOTX7luBy'
 */
router.post(
  '/setCalled',
  Validator.twilioValidationRules(),
  Validator.validate,
  PhoneController.setCalled
);

export default router;
