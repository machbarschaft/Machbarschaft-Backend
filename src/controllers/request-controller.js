'use strict';

import RequestService from '../services/request-service';
import UserService from '../services/user-service';
import { User } from '../models/user';

const createLoggedIn = async (req, res) => {
  RequestService.createRequestWithUserId(req.user.uid)
    .then((request) => {
      res.status(200).json(request);
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

const createLoggedOut = async (req, res) => {
  RequestService.createRequestWithPhone(req.body.phone)
    .then((request) => {
      res.status(200).json(request);
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

const updateLoggedIn = async (req, res) => {
  RequestService.updateRequest(req.user.uid, req.params.reqId, req.body)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

const updateLoggedOut = async (req, res) => {
  UserService.findUser(req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('No user with given phone number.'));
      }
      RequestService.updateRequest(user._id, req.params.reqId, req.body);
    })
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

module.exports = {
  createLoggedIn,
  createLoggedOut,
  updateLoggedIn,
  updateLoggedOut,
};
