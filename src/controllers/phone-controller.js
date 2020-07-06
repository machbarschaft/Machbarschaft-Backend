'use strict';

import PhoneService from '../services/phone-service';
import UserService from '../services/user-service';
import RequestService from '../services/request-service';
import ProcessService from '../services/process-service';
import ResponseService from '../services/response-service';

import Process from '../models/process-model';

const createNewTan = async (req, res) => {
  let userId, phone;
  if (req.body.userId) {
    userId = req.body.userId;
    const user = await UserService.findUserById(req.body.userId);
    phone = user.phone;
  } else {
    phone = req.body.phone;
    const user = await UserService.findUserByPhone(req.body.phone);
    userId = user._id;
  }
  if (!userId || !phone) {
    res.status(404).send('No user with given id or phone number.');
    return;
  }
  PhoneService.create(userId, phone, req.body.sms)
    .then((request) => {
      res.status(201).send();
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const confirmTan = async (req, res) => {
  let userId;
  if (req.body.userId) {
    userId = req.body.userId;
  } else {
    const user = await UserService.findUserByPhone(req.body.phone);
    userId = user._id;
  }
  PhoneService.confirm(req.body.tan, userId)
    .then((phoneNumber) => {
      let options = {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        //secure: true
      };

      res.cookie('machbarschaft_phoneVerified', phoneNumber, options);

      res.status(200).json(phoneNumber);
      return;
    })
    .catch((error) => {
      if (error.message === 'There was no tan generated for the given user.') {
        res.status(404).send(error.message);
        return;
      }
      if (
        error.message === 'This tan is expired.' ||
        error.message === 'The tan is incorrect.'
      ) {
        res.status(400).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const findNumber = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    req.body.phone = req.body.phone.toString().substring(3);
    UserService.findUserByPhone(req.body.phone);
  } else
    return Promise.reject(new Error('No user with given phone number.'))
      .then((user) => {
        return ResponseService.findResponseByUserId(user._id);
      })
      .then((response) => {
        return ProcessService.getProcess(response.process);
      })
      .then((process) => {
        return RequestService.getRequest(
          process.requests[process.requests.length - 1]
        );
      })
      .then((request) => {
        return UserService.findUserById(request.user);
      })
      .then((user) => {
        res
          .status(200)

          .json({ phone: '+49' + user.phone });
        return;
      })
      .catch((error) => {
        if (error.message === 'Not allowed.') {
          res.status(403).send(error.message);
          return;
        }
        if (
          error.message === 'No process with given id.' ||
          error.message === 'No response with given id.' ||
          error.message === 'No request with given id.'
        ) {
          res.status(404).send(error.message);
          return;
        }
        res.status(500).send();
        console.log(error);
        return;
      });
  return;
};

module.exports = { createNewTan, confirmTan, findNumber };
