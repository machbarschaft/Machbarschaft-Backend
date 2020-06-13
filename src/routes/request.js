import Router, { response } from 'express';
import { validate } from '../validator.js';
import ProcessModel from '../models/process';
import ResponseModel from '../models/response';
import RequestModel from '../models/request';
import passport from 'passport';
import mongoose from 'mongoose';

const router = Router();


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user by changing the cookie
 *     tags:
 *       - auth
 *     responses:
 *       401:
 *         description: couldn't find user in database
 *       500:
 *         description: JWT signing failed
 *         schema:
 *          type: object
 *          properties:
 *            err:
 *            type: array
 *       200:
 *         description: registration was successful
 */

 // ein put: letzten response überprüfen
 // ein post

// for accept

router.post('/response', passport.authenticate('jwt-cookiecombo', {
  session: false,
}),
(req, res) => {
  ProcessModel.findById(req.body.processId, function (err, process) {
    
    if (process.response) {
      ProcessModel.findById(process._id).populate({
        path  : 'response',
        match : { status : 'aborted' },
        //sort: { 'created_at' : -1 }
      }).exec(
        function (err, response) {
          if (err) {
          console.log(err); }
          if (response) {
            console.log(response);
          }
        }
      );
      // search for aborted in status
    }
    else if (process.response === null) {
      console.log('no response');
  
  ResponseModel.create(
    { user: { _id: req.user.uid }, status: 'accepted' },
    function (err, response) {
      console.log(response._id);
      ProcessModel.findOneAndUpdate(
        { _id: process._id },
        { response: { _id: response.id } },
        function (err) {
          if (err) return res.status(500).send({ error: err });
          return res.status(200).send('Succesfully saved.');
        }
      );
    }
  );
    }
  } );
 }
);

// for after accept 

router.put(
  '/response',
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    console.log('auth success');
    console.log(req.body.processId);
    ProcessModel.findById(req.body.processId), function (err, process) {

    }
     
    ProcessModel.findOne(
      {
        requests: { $in: [req.body.requestId] },
      },
      function (err, process) {
        if (err) {
          console.error(err);
          return res.status(401).send({ errors: 'couldnt find process' });
        }
        // if response already exists
        if (process.response) {
          console.log(process.response);
          console.log('if response');
          ResponseModel.findById(process.response),
            function (err, response) {
              if (err) {
                console.error(err);
                return res.status(401).send({ errors: 'couldnt find process' });
              } else if (response.status === 'accepted') {
                var status = 'called';
                console.log(status);
              } else if (response.status === 'called') {
                var status = 'on-the-way';
              } else if (response.status === 'on-the-way') {
                var status = 'done';
              } else {
                return res.status(401);
              }

              //update the response status and timestamp
              ResponseModel.findOneAndUpdate(
                { _id: response._id },
                { status: this.status },
                function (err) {
                  if (err) return res.send(500, { error: err });
                  return res.status(200).send('Succesfully saved.');
                }
              );
            };
        } else if (!process.response) {
          // if first response, works
          console.log('first response');

          ResponseModel.create(
            { user: { _id: req.user.uid }, status: 'accepted' },
            function (err, response) {
              console.log(response._id);
              ProcessModel.findOneAndUpdate(
                { _id: process._id },
                { response: { _id: response.id } },
                function (err) {
                  if (err) return res.status(500).send({ error: err });
                  return res.status(200).send('Succesfully saved.');
                }
              );
            }
          );
        }
      }
    );
  }
);

// validate + docu fehlt

// processId

/**
 * @swagger
 * /request/details:
 *   post:
 *     summary: Get details of request
 *     description: Get all information of a help request
 *     tags:
 *       - request
 *     responses:
 *       401:
 *         description: couldn't find request
 *       200:
 *         description: giving request details
 *         schema:
 *          type: object
 *          properties:
 *            err:
 *            type: array
 */

router.post(
  '/details',
  passport.authenticate('jwt-cookiecombo', {
    session: false,
  }),
  (req, res) => {
    RequestModel.findById(req.body.requestId, function (err, request) {
      if (err) {
        console.error(err);
        return res.status(401).send({ errors: 'couldnt find request' });
      }
      if (request) {
        return res.status(200).json(request);
      }
    });
  }
);

router.get('/test', (req, res) => {
  new ProcessModel({ requests: [{ _id: '5ee25095151b0952f93d7adb' }] }).save();
});

export default router;
