'use strict';

import Router from 'express';
import AddressController from '../controllers/address-controller';
import Validator from './../validator';

const router = Router();

/**
 * @swagger
 * /address:
 *   post:
 *     summary: Create Address
 *     description: Validates the given address and saves it in the database.
 *     tags:
 *       - address
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          street:
 *                              type: String
 *                              required: true
 *                          houseNumber:
 *                              type: Number
 *                              required: true
 *                          zipCode:
 *                              type: Number
 *                              required: true
 *                          city:
 *                              type: String
 *                              required: true
 *                          country:
 *                              type: String
 *                              required: true
 *     responses:
 *       200:
 *         description: Successfully validated and created address.
 *         content:
 *          application/json:
 *              schema:
 *                  type: address
 *       500:
 *          description: Internal server error
 */
router.post(
  '/',
  Validator.addressValidationRules(),
  Validator.validate,
  AddressController.createAddress
);

export default router;
