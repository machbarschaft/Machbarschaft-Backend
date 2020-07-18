'use strict';

import PhoneService from '../services/phone-service';
import UserService from '../services/user-service';
import RequestService from '../services/request-service';
import ProcessService from '../services/process-service';
import ResponseService from '../services/response-service';

import Process from '../models/process-model';
import APIError from '../errors';

const createNewTan = async (req, res) => {
  let user;
  if (req.body.userId) {
    user = await UserService.findUserById(req.body.userId);
  } else {
    user = await UserService.findUserByPhone(
      req.body.countryCode,
      req.body.phone
    );
  }
  if (!user) {
    res
      .status(404)
      .send('Es gibt keinen Benutzer mit der gegebenen ID/Telefonnummer.');
    return;
  }
  PhoneService.create(user._id, user.countryCode, user.phone, req.body.sms)
    .then((request) => {
      res.status(201).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const confirmTan = async (req, res) => {
  let userId;
  if (req.body.userId) {
    userId = req.body.userId;
  } else {
    const user = await UserService.findUserByPhone(
      req.body.countryCode,
      req.body.phone
    );
    userId = user._id;
  }
  PhoneService.confirm(req.body.tan, userId)
    .then((phoneNumber) => {
      let options = {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.CORS_ENV === 'development' ? false : true,
      };

      res.cookie('machbarschaft_phoneVerified', phoneNumber, options);

      res.status(200).json(phoneNumber);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const setCalled = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    if (req.body.status === 'completed') {
      const countryCode = req.body.phone.substring(1, 3);
      const phone = req.body.phone.substring(3);
      UserService.findUserByPhone(countryCode, phone)
        .then((user) => {
          return ResponseService.findActiveResponseByUserId(user._id);
        })
        .then((response) => {
          response.status = 'called';
          response.log.set('called', Date.now());
          response.save();
          res.status(200).send();
          return;
        })
        .catch((error) => {
          APIError.handleError(error, res);
          return;
        });
    } else {
      res.status(200).send();
    }
  } else {
    res.status(401).send('Unauthorized.');
  }
  return;
};

const findNumber = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    let helperName = '';
    let helpSeekerName = '';
    const countryCode = req.body.phone.substring(1, 3);
    const phone = req.body.phone.substring(3);
    UserService.findUserByPhone(countryCode, phone)
      .then((user) => {
        helperName = user.profile.name;
        return ResponseService.findActiveResponseByUserId(user._id);
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
        helpSeekerName = request.name;
        return UserService.findUserById(request.user);
      })
      .then((user) => {
        res.status(200).json({
          phone: '+' + user.countryCode.toString() + user.phone.toString(),
          helpSeekerName: helpSeekerName,
          helperName: helperName,
        });
        return;
      })
      .catch((error) => {
        APIError.handleError(error, res);
        return;
      });
  } else {
    res.status(401).send('Unauthorized.');
  }
  return;
};

module.exports = { createNewTan, confirmTan, findNumber, setCalled };
