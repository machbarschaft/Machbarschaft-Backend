'use strict';

import RequestService from '../services/request-service';
import UserService from '../services/user-service';
import APIError from '../errors';

const createLoggedIn = async (req, res) => {
  RequestService.createRequestWithUserId(req.user.uid)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
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
      APIError.handleError(error, res);
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
      APIError.handleError(error, res);
      return;
    });
  return;
};

const updateLoggedOut = async (req, res) => {
  UserService.findUserByPhone(req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new APIError(
            404,
            'Es gibt keinen Benutzer mit der gegebenen Telefonnummer.'
          )
        );
      }
      return RequestService.updateRequest(user._id, req.params.reqId, req.body);
    })
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
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
      APIError.handleError(error, res);
      return;
    });
  return;
};

const publishLoggedOut = async (req, res) => {
  if (req.cookies.machbarschaft_phoneVerified !== req.query.phone) {
    res.status(401).send('Die Telefonnummer ist nicht verifiziert.');
    return;
  }

  UserService.findUserByPhone(req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new APIError(
            404,
            'Es gibt keinen Benutzer mit der gegebenen Telefonnummer.'
          )
        );
      }
      return RequestService.publishRequest(user._id, req.params.reqId);
    })
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
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
      APIError.handleError(error, res);
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
      APIError.handleError(error, res);
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
