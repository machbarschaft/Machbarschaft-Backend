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
      request['_doc']['phoneVerifiedCookieMatch'] =
        req.cookies.machbarschaft_phoneVerified !== undefined &&
        req.cookies.machbarschaft_phoneVerified === req.query.phone;
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
      if (error.message === 'Request is already published.') {
        res.status(400).send(error.message);
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
      if (error.message === 'Request is already published.') {
        res.status(400).send(error.message);
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
  if (req.cookies.machbarschaft_phoneVerified !== req.query.phone) {
    res.status(401).send('Phone not verified');
    return;
  }

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
      if (error.message === 'Phone not validated') {
        res.status(401).send(error.message);
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

const reopenRequest = async (req, res) => {
  RequestService.reopenRequest(req.user.uid, req.params.reqId)
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
      if (
        error.message === 'Only requests with status "done" can reopen.' ||
        error.message ===
          'Request can only be reopened after giving feedback to this process and asking for contact.'
      ) {
        res.status(400).send(error.message);
        return;
      }
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

const getOpenRequestsNearby = async (req, res) => {
  RequestService.getOpenRequestsNearby(
    req.user.uid,
    req.query.latitude,
    req.query.longitude
  )
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      if (error.message === 'Current position not provided.') {
        res.status(400).send(error.message);
        return;
      }
      console.log(error);
      res.status(500).send();
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
  reopenRequest,
  getOpenRequestsNearby,
};
