'use strict';

import ConfirmPhoneService from '../services/confirm-phone-service';
import UserService from '../services/user-service';

const verifyMe = async (req, res) => {
  //ToDo check whether sender has cookie
};

const createNewTan = async (req, res) => {
  let userId, phone;
  if (req.body.userId) {
    userId = req.body.userId;
    phone = await UserService.findUserById(req.body.userId).phone;
  } else {
    phone = req.body.phone;
    userId = await UserService.findUserByPhone(req.body.phone)._id;
  }
  ConfirmPhoneService.create(userId, phone, req.body.sms)
    .then((request) => {
      res.status(200).json(request);
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

const confirmTan = async (req, res) => {
  let userId;
  if (req.body.userId) {
    userId = req.body.userId;
  } else {
    userId = await UserService.findUserByPhone(req.body.phone)._id;
  }
  ConfirmPhoneService.confirm(req.body.tan, userId)
    .then((request) => {
      res.status(200).json(request);
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

module.exports = { verifyMe, createNewTan, confirmTan };
