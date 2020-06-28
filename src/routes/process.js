import express from 'express';
import Validator from '../validator.js';
import models from '../models/bundle';
import passport from 'passport';
const { validationResult } = require('express-validator');

const router = express.Router();

/**
 * @swagger
 * /:processId/response:
 *   post:
 *     summary: Respond to request/process
 *     description: Helper can change status of help request to accepted, called, on-the-way and done
 *     tags:
 *       - request
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
  '/:processId/response',
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      if (process.response.length) {
        // get details for latest response in Array
        models.Response.findById(
          process.response[process.response.length - 1],
          function (err, response) {
            var date = Date.now();
            // if the response is from the current user and not already done, change status
            if (
              response.user.toString() === req.user.uid.toString() &&
              response.status !== 'done'
            ) {
              if (response.status === 'accepted') {
                var status = 'called';
              } else if (response.status === 'called') {
                var status = 'on-the-way';
              } else if (response.status === 'on-the-way') {
                var status = 'done';
                // if help seeker didn't set finishedAt yet
                if (!process.finishedAt) {
                  process.finishedAt = date;
                  process.save();
                }
              }
              response.status = status;
              response.log.set(status, date);
              response.save();
              return res.status(200).send('Succesfully saved.');
            }
            // if the response was aborted by someone, create a new response with accepted
            else if (response.status === 'aborted') {
              var date = Date.now();
              // create new response and add to process
              models.Response.create(
                {
                  user: { _id: req.user.uid },
                  status: 'accepted',
                  log: { accepted: date },
                },
                function (err, response) {
                  models.Request.findById(
                    process.requests[process.requests.length - 1],
                    function (err, request) {
                      if (err) return res.status(401).send({ error: err });
                      request.status = 'accepted';
                      request.log.set('accepted', date);
                      request.save();
                    }
                  );
                  models.Process.findById(process._id, function (err, process) {
                    if (err) return res.status(401).send({ error: err });
                    process.response.push(response._id);
                    process.save();
                    return res.status(200).send('Succesfully saved.');
                  });
                }
              );
            } else if (err) {
              return res.status(401).send(err);
            } else {
              return res
                .status(401)
                .send('process already taken by other user or already done');
            }
          }
        );
      }
      // no response yet, create response as user accepted request
      else if (!process.response.length) {
        var date = Date.now();
        models.Request.findById(
          process.requests[process.requests.length - 1],
          function (err, request) {
            if (err) return res.status(401).send({ error: err });
            request.status = 'accepted';
            request.log.set('accepted', date);
            request.save();
          }
        );
        models.Response.create(
          {
            user: { _id: req.user.uid },
            status: 'accepted',
            log: { accepted: date },
          },
          function (err, response) {
            if (err) return res.status(401).send({ error: err });
            process.response.push(response._id);
            process.save();
            return res.status(200).send('Succesfully saved.');
          }
        );
      }
      if (err) {
        return res.status(401).send({ error: err });
      }
    });
  }
);

/**
 * @swagger
 * /:processId/request/details:
 *   get:
 *     summary: Get details of request
 *     description: Get all information of a help request
 *     tags:
 *       - request
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
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      if (err) return res.status(500).send({ error: err });
      else {
        models.Request.findById(
          process.requests[process.requests.length - 1],
          function (err, request) {
            if (err) {
              console.error(err);
              return res.status(401).send({ errors: 'could not find request' });
            }
            if (request) {
              return res.status(200).json(request);
            }
          }
        );
      }
    });
  }
);

/**
 * @swagger
 * /:processId/request/done:
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
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      // if not already marked as done!
      var date = Date.now();
      if (!process.finishedAt) {
        process.finishedAt = date;
        process.save();
      }
      if (err) return res.status(401).send({ error: err });
      models.Request.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          if (err) return res.status(401).send({ error: err });
          if (req.user.uid == request.user) {
            if (request.status === 'done')
              return res.status(401).send('request already done');
            request.status = 'done';
            request.log.set('done', date);
            request.save();
            return res.status(200).send();
          } else return res.status(401).send('not authorized');
        }
      );
    });
  }
);

/**
 * @swagger
 * /:processId/request/release:
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
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      var date = Date.now();
      if (err) return res.status(401).send({ error: err });
      process.finishedAt = undefined;
      process.save();
      // set request to open
      models.Request.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          if (err) return res.status(401).send({ error: err });
          if (req.user.uid === request.user) {
            request.status = 'open';
            request.log.set('open', date);
            request.save();
            return res.status(200).send();
          } else return res.status(401).send('not authorized');
        }
      );
      models.Response.findById(
        process.response[process.response.length - 1],
        function (err, response) {
          if (err) return res.status(401).send({ error: err });
          response.status = 'did-not-help';
          response.log.set('did-not-help', date);
          response.save();
          return res.status(200).send();
        }
      );
    });
  }
);

/**
 * @swagger
 * /:processId/request/abort:
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
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      if (err) return res.status(401).send({ error: err });
      models.Request.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          console.log(req.user.uid);
          if (err) return res.status(401).send({ error: err });
          if (
            req.user.uid.toString() === request.user.toString() &&
            !process.response.length &&
            request.status.toString() === 'open'
          ) {
            var date = Date.now();
            request.status = 'aborted';
            request.log.set('aborted', date);
            request.save();
            return res.status(200).send();
          } else {
            return res.status(401).send('user forbidden for this operation');
          }
        }
      );
    });
  }
);

/**
 * @swagger
 * /:processId/response/abort:
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
  Validator.idValidationRules(),
  Validator.cookieValidationRules(),
  Validator.validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    models.Process.findById(req.params.processId, function (err, process) {
      if (err) return res.status(401).send({ error: err });

      models.Response.findById(
        process.response[process.response.length - 1],
        function (err, response) {
          if (err) return res.status(401).send({ error: err });
          if (req.user.uid.toString() === response.user.toString()) {
            var date = Date.now();
            response.status = 'aborted';
            response.log.set('aborted', date);
            response.save();
            return res.status(200).send();
          } else {
            return res.status(401).send('user forbidden for this operation');
          }
        }
      );
    });
  }
);
