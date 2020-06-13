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
                  process.finishedAt = Date.now();
                  process.save();
                }
              }
              response.status = status;
              response.log.set(status, Date.now());
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
                  RequestModel.findOneAndUpdate(
                    { _id: process.requests[process.requests.length - 1] },
                    { status: 'accepted' },
                    function (err) {
                      if (err) return res.status(401).send({ error: err });
                    }
                  );
                  ProcessModel.findOneAndUpdate(
                    { _id: process._id },
                    { response: { _id: response._id } },
                    function (err) {
                      if (err) return res.status(401).send({ error: err });
                      return res.status(200).send('Succesfully saved.');
                    }
                  );
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
        RequestModel.findOneAndUpdate(
          { _id: process.requests[process.requests.length - 1] },
          { status: 'accepted' },
          function (err) {
            if (err) return res.status(401).send({ error: err });
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
            ProcessModel.findOneAndUpdate(
              { _id: process._id },
              { response: { _id: response._id } },
              function (err) {
                if (err) return res.status(401).send({ error: err });
                return res.status(200).send('Succesfully saved.');
              }
            );
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
    ProcessModel.findById(req.body.processId),
      function (err, process) {
        if (err) return res.status(500).send({ error: err });
        else {
          RequestModel.findById(
            process.requests[process.request.length - 1],
            function (err, request) {
              if (err) {
                console.error(err);
                return res
                  .status(401)
                  .send({ errors: 'could not find request' });
              }
              if (request) {
                return res.status(200).json(request);
              }
            }
          );
        }
      };
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
    ProcessModel.findById(req.body.processId),
      function (err, process) {
        if (!process.finishedAt) {
          process.finishedAt = Date.now();
          process.save();
        }
        RequestModel.findOneAndUpdate(
          { _id: process.requests[process.requests.length - 1] },
          { status: 'done' },
          function (err) {
            if (err) return res.status(401).send({ error: err });
            return res.status(200).send();
          }
        );
        if (err) return res.status(401).send({ error: err });
      };
  }
);

/**
 * @swagger
 * /request/release:
 *   post:
 *     summary: Help seeker marks process as done
 *     description: Help seeker can mark a process as successfully done
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

/* 

router.post(
  '/release',
  processValidationRules(),
  cookieValidationRules(),
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    ProcessModel.findById(req.body.processId),
      function (err, process) {
        // set request to open
        // set last response to aborted
      };
  }
); */

/* // for testing purposes: create process

router.get('/test', (req, res) => {
  new ProcessModel({ requests: [{ _id: '5ee25095151b0952f93d7adb' }] }).save();
});
*/

export default router;
