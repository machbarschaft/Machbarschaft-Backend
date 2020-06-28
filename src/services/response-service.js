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
    console.log(processId);
    console.log(userId);
    var response = new models.Response({
      status: 'accepted',
      user: userId,
      process: processId,
    });
    response.log.set('accepted', Date.now());
    response.save();
    console.log(response._id);
    ProcessService.updateProcess(processId, { response: response._id });
    var process = ProcessService.getProcess(processId);
    RequestService.updateRequest(
      userId,
      process.requests[process.requests.length - 1],
      { status: 'accepted' }
    );
    return response;
  }
}
