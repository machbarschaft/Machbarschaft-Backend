'use strict';

import Router from 'express';
import Validator from './../validator';
import ContactController from "../controllers/contact-controller";

const router = Router();

/**
 * @swagger
 * /contact:
 *   post:
 *     summary: Create Contact
 *     description: Saves the contact enquiry from the public contact form.
 *     tags:
 *       - contact
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded:
 *              schema:
 *                  type: object
 *                  properties:
 *                          email:
 *                              type: String
 *                              required: true
 *                          text:
 *                              type: Number
 *                              required: true
 *     responses:
 *       200:
 *         description: Successfully create contact enquiry.
 *         content:
 *          application/json:
 *              schema:
 *                  type: contact
 *       500:
 *          description: Internal server error
 */
router.post(
    '/',
    Validator.contactFormValidationRules(),
    Validator.validate,
    ContactController.createContact
);

export default router;