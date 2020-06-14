'use strict';

import ConfirmPhoneService from '../services/confirm-phone-service';
import UserService from '../services/user-service';

const verifyMe = async (req, res) => {
  //ToDo check whether sender has cookie
};

const createNewTan = async (req, res) => {
  let user, phone;
  if (req.body.user) {
    user = req.body.user;
    phone = await UserService.findUserById(req.body.user).phone;
  } else {
    phone = req.body.phone;
    user = await UserService.findUserByPhone(req.body.phone)._id;
  }
  ConfirmPhoneService.create(user, phone, req.body.sms)
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
  if (req.body.user) {
    userId = req.body.user;
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
