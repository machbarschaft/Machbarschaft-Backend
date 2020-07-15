'use strict';

import models from '../models/bundle';
import ProcessService from './process-service';
import RequestService from './request-service';
import { response } from 'express';
import APIError from '../errors';
import UserService from './user-service';

export default class ResponseService {
  static async updateResponse(responseId, status) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Prozess mit der gegebenen ID.')
      );
    }
    response.status = status;
    if (response.log.includes(status)) {
      return Promise.reject(new APIError(400, 'Ungültiger Status.'));
    }
    response.log.set(status, Date.now());

    return response.save();
  }

  static async abortResponse(userId, responseId, requestId) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Prozess mit der gegebenen ID.')
      );
    }
    if (response.user.toString() !== userId) {
      return Promise.reject(
        new APIError(403, 'Zugriff auf diese Auftragannahme verweigert.')
      );
    }
    if (response.status.toString() === 'aborted')
      return Promise.reject(
        new APIError(400, 'Auftragannahme ist bereits abgebrochen.')
      );
    response.status = 'aborted';
    response.log.set(response.status, Date.now());
    response.save();
    const request = await models.Request.findById(requestId);
    if (!request) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftrag mit der gegebenen ID.')
      );
    }
    request.status = 'open';
    request.log.set(request.status, Date.now());
    request.save();
    return response;
  }

  static async getResponse(responseId) {
    const response = await models.Response.findById(responseId);
    if (!response) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftragannahme mit der gegebenen ID.')
      );
    }
    return response;
  }
  static async findActiveResponseByUserId(userId) {
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
      return Promise.reject(
        new APIError(404, 'Keine laufende Auftragannahme gefunden.')
      );
    }
    return response;
  }

  static async createResponse(userId, processId) {
    if (!(await UserService.isVerified(userId))) {
      return Promise.reject(
        new APIError(401, 'Die Telefonnummer ist nicht verifiziert.')
      );
    }

    let process = await ProcessService.getProcess(processId);
    if (!process) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Prozess mit der gegebenen ID.')
      );
    }
    if (process.response.length) {
      const mostRecentResponse = await this.getResponse(
        process.response[process.response.length - 1]
      );
      if (
        mostRecentResponse.status !== 'aborted' &&
        mostRecentResponse.status !== 'did-not-help'
      ) {
        return Promise.reject(
          new APIError(400, 'Auftrag wurde bereits angenommen.')
        );
      }
    }

    let request = await RequestService.getRequest(
      process.requests[process.requests.length - 1]
    );
    if (request.status !== 'open') {
      return Promise.reject(
        new Error('Tried to accept a request, which was not open.')
      );
    }
    request.status = 'accepted';

    let response = new models.Response({
      status: 'accepted',
      user: userId,
      process: processId,
    });
    return response
      .save()
      .then((response) => {
        ProcessService.updateProcess(processId, { response: response._id });
      })
      .then(() => {
        request.save();
      });
  }
}
