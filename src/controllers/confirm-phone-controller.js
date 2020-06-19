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
  ConfirmPhoneService.create(userId, phone, req.body.sms)
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
  ConfirmPhoneService.confirm(req.body.tan, userId)
    .then((request) => {
      res.status(200).json(request);
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

module.exports = { verifyMe, createNewTan, confirmTan };
