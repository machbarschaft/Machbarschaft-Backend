'use strict';

import models from '../models/bundle';
import { statusStages } from '../models/request-model';
import UserService from './user-service';

export default class RequestService {
  static async createRequestWithUserId(userId) {
    let request = await models.Request.findOne({
      user: userId,
      status: statusStages[0],
    });
    if (request) {
      return request;
    }

    const process = new models.Process();
    request = new models.Request({ process: process._id, user: userId });
    process.requests = [request._id];

    request.save();
    process.save();

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

  static async reopenRequest(userId, requestId) {
    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }
    if (request.user.toString() !== userId) {
      return Promise.reject(new Error('Not your request.'));
    }

    if (request.status !== 'done') {
      return Promise.reject(
        new Error('Only requests with status "done" can reopen.')
      );
    }

    const feedbacks = await models.ProcessFeedback.find({
      process: request.process,
      user: userId,
      needContact: true,
    }).sort({
      createdAt: -1,
    });
    if (
      feedbacks.length === 0 ||
      feedbacks[0].createdAt.getTime() < Date.now() - 30 * 60 * 1000
    ) {
      return Promise.reject(
        new Error(
          'Request can only be reopened after giving feedback to this process and asking for contact.'
        )
      );
    }
    request.status = 'reopened';
    request.log.set(request.status, Date.now());
    request.save();

    const newRequest = new models.Request({
      process: request.process,
      user: userId,
      status: 'open',
      name: request.name,
      address: request.address,
      requestType: request.requestType,
      urgency: request.urgency,
    });
    newRequest.log = { open: Date.now() };
    if (request.extras) {
      newRequest.extras = request.requestType;
    }

    const process = await models.Process.findOne({ _id: request.process });
    process.requests.push(newRequest._id);
    process.save();

    return newRequest.save();
  }
}
