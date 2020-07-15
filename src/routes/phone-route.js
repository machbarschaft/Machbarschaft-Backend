'use strict';

import Router from 'express';
import PhoneController from '../controllers/phone-controller';
import Validator from '../validator';
import { body } from 'express-validator';

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
 *                      phone:
 *                          type: Number
 *                      tan:
 *                          type: Number
 */
router.put(
  '/tan',
  Validator.requireUserIdOrPhoneNumber(),
  [
    body('tan', 'Der Tan besteht aus vier Ziffern und muss angegeben werden.')
      .exists()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .toInt(),
  ],
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
 *                      phone:
 *                          type: Number
 *                      sms:
 *                          type: Boolean
 */
router.post(
  '/tan',
  Validator.requireUserIdOrPhoneNumber(),
  [
    body(
      'sms',
      "Specify whether you prefer to receive the tan per sms with 'true' or 'false'."
    )
      .exists()
      .isBoolean(),
  ],
  Validator.validate,
  PhoneController.createNewTan
);

/**
 * @swagger
 * /phone/findNumber:
 *  get:
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
 *                          type: Number
 *                      secret:
 *                          type: string
 */
router.get(
  '/findNumber',
  Validator.requireUserIdOrPhoneNumber(),
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
 *                          type: Number
 *                      secret:
 *                          type: string
 */
router.post(
  '/setCalled',
  Validator.requireUserIdOrPhoneNumber(),
  Validator.validate,
  PhoneController.setCalled
);

export default router;
