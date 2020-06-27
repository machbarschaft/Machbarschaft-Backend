'use strict';

import Router from 'express';
import ConfirmPhoneController from './../controllers/confirm-phone-controller';
import Validator from './../validator';
import { body } from 'express-validator';

const router = Router();

router.get('/', ConfirmPhoneController.verifyMe);

/**
 * @swagger
 * /confirm-phone:
 *  put:
 *      summary: Confirm phone with tan
 *      description: Verify your phone by entering the tan send by Twilio to your phone.
 *      tags:
 *          - phone-verification
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
  '/',
  Validator.requireUserIdOrPhoneNumber(),
  [
    body('tan', 'Der Tan besteht aus vier Ziffern und muss angegeben werden.')
      .exists()
      .isNumeric()
      .isLength({ min: 4, max: 4 })
      .toInt(),
  ],
  Validator.validate,
  ConfirmPhoneController.confirmTan
);

/**
 * @swagger
 * /confirm-phone:
 *  post:
 *      summary: Generate new tan.
 *      description: Generate a new tan and initiate Twilio call/sms.
 *      tags:
 *          - phone-verification
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
  '/',
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
  ConfirmPhoneController.createNewTan
);

export default router;
