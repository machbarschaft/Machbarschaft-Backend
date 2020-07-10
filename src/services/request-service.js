'use strict';

import models from '../models/bundle';
import { statusStages } from '../models/request-model';
import UserService from './user-service';
import ProcessService from './process-service';
import { User } from '../models/user-model';

export default class RequestService {
  static async createRequestWithUserId(userId) {
    let request = await models.Request.findOne({
      user: userId,
      status: statusStages[0],
    });
    if (request) {
      return request;
    }

    const process = await ProcessService.createProcess();
    request = new models.Request({ process: process._id, user: userId });
    request.save();
    process.requests.push(request._id);
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
      user = await UserService.createUser(phone, null);
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
    if (requestBody.status) {
      request.status = requestBody.status;
      request.log.set(requestBody.status, Date.now());
    }
    if (requestBody.urgency) {
      request.urgency = requestBody.urgency;
    }
    if (requestBody.forename) {
      request.forename = requestBody.forename;
    }
    if (requestBody.surname) {
      request.surname = requestBody.surname;
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
    const user = await models.User.findOne({ _id: userId });
    if (!user.phoneVerified) {
      return Promise.reject(new Error('Phone not validated'));
    }

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
      request.forename &&
      request.surname &&
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
      newRequest.extras = request.extras;
    }

    const process = await models.Process.findOne({ _id: request.process });
    process.requests.push(newRequest._id);
    process.save();

    return newRequest.save();
  }

  static async getOpenRequestsNearby(userId, currentLat, currentLng) {
    const user = await UserService.findUserById(userId);
    if (!currentLat || !currentLng) {
      if (!user.preferences.staticPosition) {
        return Promise.reject(new Error('Current position not provided.'));
      }
      const address = await models.Address.findOne({
        _id: user.preferences.staticPosition,
      });
      currentLng = address.geoLocation.longitude;
      currentLat = address.geoLocation.latitude;
    }
    const openRequests = await models.Request.find({ status: 'open' });
    let result = [];
    for (const request of openRequests) {
      const requestAddress = await models.Address.findOne({
        _id: request.address,
      });
      if (
        this.calculateDistance(
          currentLat,
          currentLng,
          requestAddress.geoLocation.latitude,
          requestAddress.geoLocation.longitude
        ) < user.preferences.radius
      ) {
        console.log(request);
        result.push(request);
      }
    }
    return Promise.resolve(result);
  }

  /*
  Measures the distance in metres between two positions (defined by latitude and longitude).
  Formula provided by: https://www.movable-type.co.uk/scripts/latlong.html
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // in metres
    console.log(d);
    return d;
  }
}
