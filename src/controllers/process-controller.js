'use strict';

import RequestService from '../services/request-service';
import ProcessService from '../services/process-service';
import ResponseService from '../services/response-service';
import UserService from '../services/user-service';
import APIError from '../errors';

const getRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return RequestService.getRequest(
        process.requests[process.requests.length - 1]
      );
    })
    .then((request) => {
      if (!request) {
        return Promise.reject(
          new APIError(404, 'Es gibt keinen Auftrag mit der gegebenen ID.')
        );
      }
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const changeRequestToDone = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      if (!process.finishedAt) {
        ProcessService.updateProcess(process._id, { finishedAt: Date.now() });
      }
      return RequestService.getRequest(
        process.requests[process.requests.length - 1]
      );
    })
    .then((request) => {
      if (request.status === 'done')
        return Promise.reject(
          new APIError(400, 'Auftrag ist bereits abgeschlossen.')
        );
      else {
        RequestService.updateRequest(req.user.uid, request._id, {
          status: 'done',
        });
        res.status(200).send();
        return;
      }
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const abortResponse = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return ResponseService.abortResponse(
        req.user.uid,
        process.response[process.response.length - 1],
        process.requests[process.requests.length - 1]
      );
    })
    .then((response) => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const abortRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return RequestService.updateStatus(
        req.user.uid,
        process.requests[process.requests.length - 1],
        'aborted'
      ).then(() => {
        res.status(200).send();
        return;
      });
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const releaseRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      ProcessService.updateProcess(process._id, { finishedAt: undefined });
      ResponseService.updateResponse(
        process.response[process.response.length - 1],
        'did-not-help'
      );
      RequestService.updateRequest(
        req.user.uid,
        process.requests[process.requests.length - 1],
        {
          status: 'open',
        }
      );
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const changeResponse = async (req, res) => {
  let process;
  ProcessService.getProcess(req.params.processId)
    .then((result) => {
      process = result;
      return ResponseService.getResponse(
        process.response[process.response.length - 1]
      );
    })
    .then((response) => {
      if (
        response.user.toString() === req.user.uid.toString() &&
        response.status !== 'done' &&
        response.status !== 'aborted'
      ) {
        let status;
        if (response.status === 'accepted') {
          status = 'called';
        } else if (response.status === 'called') {
          status = 'on-the-way';
        } else if (response.status === 'on-the-way') {
          status = 'done';
          if (!process.finishedAt) {
            ProcessService.updateProcess(process._id, {
              finishedAt: Date.now(),
            });
          }
        }
        ResponseService.updateResponse(response._id, status);
        res.status(200).send();
        return;
      } else {
        return Promise.reject(new APIError(403, 'Aktion nicht erlaubt.'));
      }
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const createResponse = async (req, res) => {
  ResponseService.createResponse(req.user.uid, req.params.processId)
    .then(() => {
      res.status(201).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

module.exports = {
  getRequest,
  changeRequestToDone,
  abortResponse,
  abortRequest,
  releaseRequest,
  changeResponse,
  createResponse,
};
