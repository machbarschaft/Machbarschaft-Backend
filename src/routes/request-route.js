import Router from 'express';
import RequestController from './../controllers/request-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /request/guest:
 *   post:
 *     summary: Create a new request as guest
 *     description: Creates a new request for the user with the given phone number without being logged in. If this user already has a request in the 'creation' stage, this request is returned and can be worked on until it is ready to be published.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully created or loaded unpublished request.
 *         schema:
 *           type: request
 *       500:
 *          description: Internal server error
 */
router.post(
  '/guest',
  Validator.phoneValidationRules(),
  Validator.validate,
  RequestController.createLoggedOut
);

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Create a new request
 *     description: Creates a new request for the authenticated user. If this user already has a request in the 'creation' stage, this request is returned and can be worked on until it is ready to be published.
 *     tags:
 *       - request
 *     responses:
 *       200:
 *         description: Successfully created or loaded unpublished request.
 *         schema:
 *           type: request
 *       500:
 *          description: Internal server error
 */
router.post(
  '/',
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.createLoggedIn
);

/**
 * @swagger
 * /request/{reqId}:
 *   put:
 *     summary: Update the request
 *     description: Update the request specified by the 'reqId'.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded
 *              schema:
 *                  type: object
 *                      properties:
 *                          name:
 *                              type: String
 *                              required: false
 *                          addressId:
 *                              type: ObjectId
 *                              required: false
 *                          requestType:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - groceries
 *                                  - medication
 *                                  - other
 *                          urgency:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - now
 *                                  - today
 *                                  - tomorrow
 *                                  - this-week
 *                          prescriptionRequired:
 *                              type: Boolean
 *                              required: false
 *                          carNecessary:
 *                              type: Boolean
 *                              required: false
 *     responses:
 *       200:
 *         description: Successfully updated request.
 *         schema:
 *           type: request
 *       400:
 *          description: Request is already published.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.updateLoggedIn
);

/**
 * @swagger
 * /request/guest/{reqId}:
 *   put:
 *     summary: Update the request as guest
 *     description: Update the request specified by the 'reqId' as guest.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     requestBody:
 *      content:
 *          application/x-www-form-urlencoded
 *              schema:
 *                  type: object
 *                      properties:
 *                          name:
 *                              type: String
 *                              required: false
 *                          addressId:
 *                              type: ObjectId
 *                              required: false
 *                          requestType:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - groceries
 *                                  - medication
 *                                  - other
 *                          urgency:
 *                              type: String
 *                              required: false
 *                              enum:
 *                                  - now
 *                                  - today
 *                                  - tomorrow
 *                                  - this-week
 *                          prescriptionRequired:
 *                              type: Boolean
 *                              required: false
 *                          carNecessary:
 *                              type: Boolean
 *                              required: false
 *     responses:
 *       200:
 *         description: Successfully updated request.
 *         schema:
 *           type: request
 *       400:
 *          description: Request is already published.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No user with given phone number.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/guest/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.phoneValidationRules(),
  Validator.requestValidationRules(),
  Validator.validate,
  RequestController.updateLoggedOut
);

/**
 * @swagger
 * /request/publish/{reqId}:
 *   put:
 *     summary: Publish request
 *     description: Publish the request with 'reqId' as id. This is only successful if all necessary information has been added to the request.
 *     tags:
 *       - request
 *     parameters:
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully published the request.
 *       400:
 *          description: Request does not contain necessary information.
 *       400:
 *          description: Request has been published before.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/publish/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  RequestController.publishLoggedIn
);

/**
 * @swagger
 * /request/guest/publish/{reqId}:
 *   put:
 *     summary: Publish request as guest
 *     description: Publish the request with 'reqId' as a guest. This is only successful if all necessary information has been added to the request.
 *     tags:
 *       - request
 *     parameters:
 *      - in: query
 *        name: phone
 *        type: Number
 *        required: true
 *      - in: path
 *        name: reqId
 *        type: ObjectId
 *        required: true
 *     responses:
 *       200:
 *         description: Successfully published the request.
 *       400:
 *          description: Request does not contain necessary information.
 *       400:
 *          description: Request has been published before.
 *       401:
 *          description: Not your request.
 *       404:
 *          description: No user with given phone number.
 *       404:
 *          description: No request with given id.
 *       500:
 *          description: Internal server error
 */
router.put(
  '/guest/publish/:reqId',
  Validator.idValidationRules('reqId'),
  Validator.validate,
  RequestController.publishLoggedOut
); //ToDo: validate VerifiedPhone cookie

export default router;
