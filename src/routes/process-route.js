import Router from 'express';
import passport from 'passport';
import ProcessController from '../controllers/process-controller';
import Validator from '../validator';

const router = Router();

/**
 * @swagger
 * /process/{processId}/request/done:
 *   put:
 *     summary: Help seeker marks request as done
 *     description: Help seeker can mark a request as successfully done
 *     tags:
 *       - process
 *       - request
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: status change was successful
 *       400:
 *         description: request already done
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.put(
  '/:processId/request/done',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.changeRequestToDone
);

/**
 * @swagger
 * /process/{processId}/request/details:
 *   get:
 *     summary: Get details of request
 *     description: Get all information of a help request
 *     tags:
 *       - process
 *       - request
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: giving request details
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                    user:
 *                      type: objectid
 *                      example: '5f14732f59ff6dm9386ee0d1'
 *                    status:
 *                      type: string
 *                      enum: [creating, open, accepted, done, replaced, aborted]
 *                    requestType:
 *                      type: string
 *                      enum: [groceries, medication, other]
 *                    urgency:
 *                      type: string
 *                      enum: [now, today, tomorrow, this-week]
 *                    extras:
 *                      type: object
 *                      properties:
 *                        carNecessary:
 *                          type: boolean
 *                        prescriptionRequired:
 *                          type: boolean
 *                    privacyAgreed:
 *                      type: boolean
 *                    locale:
 *                      type: string
 *                      example: 'de'
 *                    log:
 *                      type: array
 *                    createdAt:
 *                      type: date
 *                      example: '2020-07-01T17:40:18.481Z'
 *                    updatedAt:
 *                      type: date
 *                      example: '2020-07-01T17:40:18.501Z'
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.get(
  '/:processId/request/details',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.getRequest
);

/**
 * @swagger
 * /process/{processId}/response/abort:
 *   put:
 *     summary: Helper aborts a response
 *     description: The response will be marked as aborted in its status
 *     tags:
 *       - process
 *       - response
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: abortion was successful
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.put(
  '/:processId/response/abort',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.abortResponse
);

/**
 * @swagger
 * /process/{processId}/request/abort:
 *   put:
 *     summary: Help seeker aborts a request
 *     description: The help request will be marked as aborted in its status
 *     tags:
 *       - process
 *       - request
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: abortion was successful
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.put(
  '/:processId/request/abort',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.abortRequest
);

/**
 * @swagger
 * /process/{processId}/request/release:
 *   put:
 *     summary: Help seeker releases existing request
 *     description: The help request will be marked as open again, and the response as did-not-help
 *     tags:
 *       - process
 *       - request
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: release was successful
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.put(
  '/:processId/request/release',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.releaseRequest
);

/**
 * @swagger
 * /process/{processId}/response:
 *   post:
 *     summary: Create a new response to request/process
 *     description: Helper can accept a help request
 *     tags:
 *       - process
 *       - response
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: response creation was successful
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.post(
  '/:processId/response',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.createResponse
);

/**
 * @swagger
 * /process/{processId}/response:
 *   put:
 *     summary: Respond to request/process
 *     description: Helper can change status of help request to accepted, called, on-the-way and done
 *     tags:
 *       - process
 *       - response
 *     parameters:
 *       - in: path
 *         name: processId
 *         required: true
 *     responses:
 *       200:
 *         description: status change was successful
 *       401:
 *         description: not authorized
 *       404:
 *         description: not found
 *       500:
 *         description: Internal server error
 */

router.put(
  '/:processId/response',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules('jwt'),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.changeResponse
);

export default router;
