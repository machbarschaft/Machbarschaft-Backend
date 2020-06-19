'use strict';

import RequestService from '../services/request-service';
import UserService from '../services/user-service';

const createLoggedIn = async (req, res) => {
  RequestService.createRequestWithUserId(req.user.uid)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const createLoggedOut = async (req, res) => {
  RequestService.createRequestWithPhone(req.query.phone)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const updateLoggedIn = async (req, res) => {
  RequestService.updateRequest(req.user.uid, req.params.reqId, req.body)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      if (error.message === 'No request with given id.') {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your request.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const updateLoggedOut = async (req, res) => {
  UserService.findUserByPhone(req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('No user with given phone number.'));
      }
      return RequestService.updateRequest(user._id, req.params.reqId, req.body);
    })
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      if (
        error.message === 'No user with given phone number.' ||
        error.message === 'No request with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your request.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const publishLoggedIn = async (req, res) => {
  RequestService.publishRequest(req.user.uid, req.params.reqId)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (error.message === 'No request with given id.') {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your request.') {
        res.status(401).send(error.message);
        return;
      }
      if (error.message === 'Request does not contain necessary information.') {
        res.status(400).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const publishLoggedOut = async (req, res) => {
  UserService.findUserByPhone(req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('No user with given phone number.'));
      }
      return RequestService.publishRequest(user._id, req.params.reqId);
    })
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (
        error.message === 'No user with given phone number.' ||
        error.message === 'No request with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your request.') {
        res.status(401).send(error.message);
        return;
      }
      if (
        error.message === 'Request has been published before.' ||
        error.message === 'Request does not contain necessary information.'
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

module.exports = {
  createLoggedIn,
  createLoggedOut,
  updateLoggedIn,
  updateLoggedOut,
  publishLoggedIn,
  publishLoggedOut,
};
