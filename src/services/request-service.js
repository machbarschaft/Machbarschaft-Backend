'use strict';

import models from '../models/bundle';
import { statusStages } from '../models/request-model';
import UserService from './user-service';
import ProcessService from './process-service';

export default class RequestService {
  static async createRequestWithUserId(userId) {
    let request = await models.Request.findOne({
      user: userId,
      status: statusStages[0],
    });
    if (request) {
      return request;
    }

    request = new models.Request({ process: process._id, user: userId });
    const process = ProcessService.createProcess(request._id);
    request.save();
    process.save();

    return request;
  }

  static async getRequest(requestId) {
    const request = await models.Request.findById(requestId);
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }
    return request;
  }

  static async createRequestWithPhone(phone) {
    let user = await models.User.findOne({ phone: phone });
    if (!user) {
      user = await UserService.createUser(phone);
    }

    return this.createRequestWithUserId(user._id);
  }

  static async updateRequest(userId, requestId, requestBody) {
    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }

    if (request.user.toString() !== userId.toString()) {
      return Promise.reject(new Error('Not your request.'));
    }

    if (request.status !== statusStages[0]) {
      return Promise.reject(new Error('Request is already published.'));
    }

    if (requestBody.requestType) {
      request.requestType = requestBody.requestType;
    }
    if (requestBody.urgency) {
      request.urgency = requestBody.urgency;
    }
    if (requestBody.name) {
      request.name = requestBody.name;
    }
    if (requestBody.addressId) {
      const address = await models.Address.findOne({
        _id: requestBody.addressId,
      });
      if (!address) {
        return Promise.reject(new Error('No address with given id.'));
      }
      if (!address.requests) {
        address.requests = [requestId];
      } else {
        if (!address.requests.includes(requestId)) {
          address.requests.push(requestId);
        }
      }
      address.save();
      request.address = requestBody.addressId;
    }
    if (requestBody.prescriptionRequired || requestBody.carNecessary) {
      if (!request.extras) {
        request.extras = new models.RequestExtras();
      }
      if (requestBody.prescriptionRequired) {
        request.extras.prescriptionRequired = requestBody.prescriptionRequired;
      }
      if (requestBody.carNecessary) {
        request.extras.carNecessary = requestBody.carNecessary;
      }
    }

    return request.save();
  }

  static async publishRequest(userId, requestId) {
    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }
    if (request.user.toString() !== userId.toString()) {
      return Promise.reject(new Error('Not your request.'));
    }
    if (request.status !== statusStages[0]) {
      return Promise.reject(new Error('Request has been published before.'));
    }

    if (
      request.name &&
      request.address &&
      request.requestType &&
      request.urgency
    ) {
      request.status = statusStages[1];
      request.log.set(statusStages[1], Date.now());
      return request.save();
    }

    return Promise.reject(
      new Error('Request does not contain necessary information.')
    );
  }
}
