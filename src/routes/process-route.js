import Router from 'express';
import ProcessController from './../controllers/process-controller';
import Validator from '../validator';
import passport from 'passport';

const router = Router();

/**
 * @swagger
 * /process/{processId}/request/done:
 *   put:
 *     summary: Help seeker marks request as done
 *     description: Help seeker can mark a request as successfully done
 *     tags:
 *       - process
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: status change was successful
 */

router.put(
  '/:processId/request/done',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
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
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: could not find request
 *       200:
 *         description: giving request details
 *         schema:
 *          type: object
 *          properties:
 *            user:
 *              type: objectid
 *            status:
 *              type: string
 *              enum: [open, accepted, done]
 *            requestType:
 *              type: string
 *              enum: [groceries, medication, other]
 *            urgency:
 *              type: string
 *              enum: [now, today, tomorrow, this-week]
 *            extras:
 *              type: object
 *              properties:
 *                carNecessary:
 *                  type: boolean
 *                prescriptionRequired:
 *                  type: boolean
 *            privacyAgreed:
 *              type: boolean
 *            raw:
 *              type: string
 *            locale:
 *              type: string
 *            log:
 *              type: array
 *              items:
 *                type: date
 *            createdAt:
 *              type: date
 *            updatedAt:
 *              type: date
 *          required:
 *            - user
 *            - status
 *            - requestType
 *            - urgency
 */

router.get(
  '/:processId/request/details',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
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
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: abortion was successful
 */

router.put(
  '/:processId/response/abort',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
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
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: abortion was successful
 */

router.put(
  '/:processId/request/abort',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
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
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: release was successful
 */

router.put(
  '/:processId/request/release',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.releaseRequest
);

/**
 * @swagger
 * /process/{processId}/response/create:
 *   post:
 *     summary: Create a new response to request/process
 *     description: Helper can accept a help request
 *     tags:
 *       - process
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: status change was successful
 */

router.post(
  '/:processId/response/create',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.createResponse
);

/**
 * @swagger
 * /process/{processId}/response/change:
 *   post:
 *     summary: Respond to request/process
 *     description: Helper can change status of help request to accepted, called, on-the-way and done
 *     tags:
 *       - process
 *     requestBody:
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               processId:
 *                 type: string
 *     responses:
 *       401:
 *         description: error occured
 *       200:
 *         description: status change was successful
 */

router.put(
  '/:processId/response/change',
  Validator.idValidationRules('processId'),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  ProcessController.changeResponse
);

export default router;
