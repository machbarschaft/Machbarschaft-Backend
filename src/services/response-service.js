'use strict';

import models from '../models/bundle';
import ProcessService from './process-service';
import RequestService from './request-service';
import { response } from 'express';

export default class ResponseService {
  static async updateResponse(responseId, status) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(new Error('No process with given id.'));
    }
    response.status = status;
    if (response.log.includes(status)) {
      return Promise.reject(new Error('Status already existed.'));
    }
    response.log.set(status, Date.now());

    return response.save();
  }

  static async abortResponse(userId, responseId, requestId) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(new Error('No process with given id.'));
    }
    if (response.user.toString() !== userId) {
      return Promise.reject(new Error('Not your response.'));
    }
    if (response.status.toString() === 'aborted')
      return Promise.reject(new Error('Already aborted.'));
    response.status = 'aborted';
    response.log.set(response.status, Date.now());
    response.save();
    const request = await models.Request.findById(requestId);
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }
    request.status = 'open';
    request.log.set(request.status, Date.now());
    request.save();
    return response;
  }

  static async getResponse(responseId) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(new Error('No response with given id.'));
    }
    return response;
  }
  static async findResponseByUserId(userId) {
    const response = await models.Response.findOne({ user: userId }).sort({
      createdAt: -1,
    });
    if (
      !response ||
      response === undefined ||
      response.status === 'done' ||
      response.status === 'aborted' ||
      response.status === 'did-not-help'
    ) {
      return Promise.reject(new Error('Not allowed.'));
    }
    return response;
  }

  static async createResponse(userId, processId) {
    var response = new models.Response({
      status: 'accepted',
      user: userId,
      process: processId,
    });
    response.save();
    await ProcessService.updateProcess(processId, { response: response._id });
    var process = await ProcessService.getProcess(processId);
    var request = await RequestService.getRequest(
      process.requests[process.requests.length - 1]
    );
    request.status = 'accepted';
    request.save();
    return response;
  }
}
