'use strict';

import models from '../models/bundle';
import { statusStages } from '../models/request';
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
    process.request = [request._id];

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
    const request = models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(new Error('No request with given id.'));
    }
    if (request.user !== userId) {
      return Promise.reject(new Error('Not your request.'));
    }
  }
}
