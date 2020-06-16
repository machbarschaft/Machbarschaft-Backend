import Router, { response } from 'express';
import {
  processValidationRules,
  cookieValidationRules,
  validate,
} from '../validator.js';
import ProcessModel from '../models/process';
import ResponseModel from '../models/response';
import RequestModel from '../models/request';
import passport from 'passport';
import mongoose from 'mongoose';
const { validationResult } = require('express-validator');

const router = Router();

/**
 * @swagger
 * /request/response:
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
  '/response',
  processValidationRules(),
  cookieValidationRules(),
  validate,
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    ProcessModel.findById(req.body.processId, function (err, process) {
      if (process.response.length) {
        // get details for latest response in Array
        ResponseModel.findById(
          process.response[process.response.length - 1],
          function (err, response) {
            var date = Date.now();
            // if the response is from the current user and not already done, change status
            if (response.user == req.user.uid && response.status != 'done') {
              console.log('response.user === req.user._id && status != done');
              if (response.status === 'accepted') {
                var status = 'called';
                console.log(status);
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
              ResponseModel.create(
                {
                  user: { _id: req.user.uid },
                  status: 'accepted',
                  log: { accepted: date },
                },
                function (err, response) {
                  RequestModel.findById(
                    process.requests[process.requests.length - 1],
                    function (err, request) {
                      if (err) return res.status(401).send({ error: err });
                      request.status = 'accepted';
                      request.log.set('accepted', date);
                      request.save();
                    }
                  );
                  ProcessModel.findById(process._id, function (err, process) {
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
        RequestModel.findById(
          process.requests[process.requests.length - 1],
          function (err, request) {
            if (err) return res.status(401).send({ error: err });
            request.status = 'accepted';
            request.log.set('accepted', date);
            request.save();
          }
        );
        ResponseModel.create(
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
 * /request/details:
 *   post:
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

router.post(
  '/details',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(401).json({ errors: errors.array() });
    }
    ProcessModel.findById(req.body.processId, function (err, process) {
      if (err) return res.status(500).send({ error: err });
      else {
        RequestModel.findById(
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
 * /request/done:
 *   post:
 *     summary: Help seeker marks request as done
 *     description: Help seeker can mark a request as successfully done
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
  '/done',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    ProcessModel.findById(req.body.processId, function (err, process) {
      // if not already marked as done!
      var date = Date.now();
      if (!process.finishedAt) {
        process.finishedAt = date;
        process.save();
      }
      if (err) return res.status(401).send({ error: err });
      RequestModel.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          if (err) return res.status(401).send({ error: err });
          if (request.status === 'done')
            return res.status(401).send('request already done');
          request.status = 'done';
          request.log.set('done', date);
          request.save();
          return res.status(200).send();
        }
      );
    });
  }
);

/**
 * @swagger
 * /request/release:
 *   post:
 *     summary: Help seeker releases existing request
 *     description: The help request will be marked as open again, and the response as did-not-help
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
 *         description: release was successful
 */

router.post(
  '/release',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    ProcessModel.findById(req.body.processId, function (err, process) {
      var date = Date.now();
      if (err) return res.status(401).send({ error: err });
      process.finishedAt = undefined;
      process.save();
      // set request to open
      RequestModel.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          if (err) return res.status(401).send({ error: err });
          request.status = 'open';
          request.log.set('open', date);
          request.save();
        }
      );
      ResponseModel.findById(
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
 * /request/abortrequest:
 *   post:
 *     summary: Help seeker aborts a request
 *     description: The help request will be marked as aborted in its status
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
 *         description: abortion was successful
 */

router.post(
  '/abortrequest',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    ProcessModel.findById(req.body.processId, function (err, process) {
      if (err) return res.status(401).send({ error: err });
      RequestModel.findById(
        process.requests[process.requests.length - 1],
        function (err, request) {
          if (err) return res.status(401).send({ error: err });
          if (req.user.uid == request.user && !process.response.length) {
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
 * /request/abortresponse:
 *   post:
 *     summary: Helper aborts a response
 *     description: The help request will be marked as aborted in its status
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
 *         description: abortion was successful
 */

router.post(
  '/abortresponse',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    ProcessModel.findById(req.body.processId, function (err, process) {
      if (err) return res.status(401).send({ error: err });

      ResponseModel.findById(
        process.response[process.response.length - 1],
        function (err, response) {
          if (err) return res.status(401).send({ error: err });
          if (req.user.uid == response.user) {
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

export default router;
