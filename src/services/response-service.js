'use strict';

import models from '../models/bundle';
import ProcessService from './process-service';
import RequestService from './request-service';

export default class ResponseService {
  static async updateResponse(responseId, status) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(new Error('No process with given id.'));
    }
    response.status = status;
    response.log.set(status, Date.now());

    return response.save();
  }

  static async getResponse(responseId) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(new Error('No response with given id.'));
    }
    return response;
  }

  static async createResponse(processId, userId) {
    const response = new models.Response();
    response.status = 'accepted';
    response.user = userId;
    response.process = processId;
    response.log.set('accepted', Date.now());
    response.save();
    ProcessService.updateProcess(processId, { response: response._id });
    const process = ProcessService.getProcess(processId);
    RequestService.updateRequest(
      process.requests[process.requests.length - 1],
      { status: 'accepted' }
    );
    return response;
  }
}
