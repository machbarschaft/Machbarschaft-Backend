'use strict';

import RequestService from '../services/request-service';
import ProcessService from '../services/process-service';
import ResponseService from '../services/response-service';

const getRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return RequestService.getRequest(
        process.requests[process.requests.length - 1]
      );
    })
    .then((request) => {
      if (!request) {
        return Promise.reject(new Error('No request with given id.'));
      }
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
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
      if (req.user.uid.toString() === request.user.toString()) {
        if (request.status === 'done')
          return Promise.reject(new Error('Request is already done.'));
        else {
          RequestService.updateRequest(request._id, {
            status: 'done',
          });
          res.status(200).send();
          return;
        }
      } else return Promise.reject(new Error('Not your request.'));
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No request with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Request is already done.') {
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

const abortResponse = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return ResponseService.getResponse(
        process.response[process.response.length - 1]
      );
    })
    .then((response) => {
      if (req.user.uid.toString() === response.user.toString()) {
        ResponseService.updateResponse(response._id, {
          status: 'aborted',
        });
        res.status(200).send();
        return;
      } else {
        return Promise.reject(new Error('Not your response.'));
      }
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No response with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your response.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const abortRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      return RequestService.getRequest(
        process.requests[process.requests.length - 1]
      );
    })
    .then((request) => {
      if (
        req.user.uid.toString() === request.user.toString() &&
        !process.response.length &&
        request.status.toString() === 'open'
      ) {
        RequestService.updateRequest(request._id, {
          status: 'aborted',
        });
        res.status(200).send();
        return;
      } else {
        return Promise.reject(new Error('Not allowed.'));
      }
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No request with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not allowed.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const releaseRequest = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      ProcessService.updateProcess(process._id, { finishedAt: undefined });
      return RequestService.getRequest(
        process.requests[process.requests.length - 1]
      );
    })
    .then((request) => {
      if (req.user.uid.toString() === request.user.toString()) {
        RequestService.updateRequest(request._id, {
          status: 'open',
        });
        return ResponseService.getResponse(
          process.response[process.response.length - 1]
        );
      } else {
        return Promise.reject(new Error('Not your response.'));
      }
    })
    .then((response) => {
      ResponseService.updateResponse(response._id, {
        status: 'did-not-help',
      });
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No response with given id.' ||
        error.message === 'No request with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not your response.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const changeResponse = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
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
        if (response.status === 'accepted') {
          var status = 'called';
        } else if (response.status === 'called') {
          var status = 'on-the-way';
        } else if (response.status === 'on-the-way') {
          var status = 'done';
          if (!process.finishedAt) {
            ProcessService.updateProcess(process._id, {
              finishedAt: Date.now(),
            });
          }
        }
        ResponseService.updateResponse(response._id, {
          status: status,
        });
        res.status(200).send();
        return;
      } else {
        return Promise.reject(new Error('Not allowed.'));
      }
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No response with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (error.message === 'Not allowed.') {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const createResponse = async (req, res) => {
  ProcessService.getProcess(req.params.processId)
    .then((process) => {
      if (!process.response.length) {
        var response = ResponseService.getResponse(
          process.response[process.response.length - 1]
        );
        if (response.status === 'aborted') {
          ResponseService.createResponse(process._id, req.user.uid);
          res.status(200).send();
          return;
        } else {
          return Promise.reject(new Error('Response is already there.'));
        }
      }
      if (process.response.length) {
        ResponseService.createResponse(process._id, req.user.uid);
        res.status(200).send();
        return;
      } else {
        return Promise.reject(new Error('Not allowed.'));
      }
    })
    .catch((error) => {
      if (
        error.message === 'No process with given id.' ||
        error.message === 'No response with given id.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      if (
        error.message === 'Response is already there.' ||
        error.message === 'Not allowed'
      ) {
        res.status(401).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
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
