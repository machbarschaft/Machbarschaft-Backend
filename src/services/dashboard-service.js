'use strict';

import models from '../models/bundle';
import AddressService from './address-service';
import UserService from './user-service';
import RequestService from './request-service';

export default class DashboardService {
  static async getActiveRequests(userId) {
    return {
      helpSeeker: await this.getActiveRequestsHelpSeeker(userId),
      helper: await this.getActiveRequestHelper(userId),
    };
  }

  static async getActiveRequestsHelpSeeker(userId) {
    const activeRequests = await models.Request.find({
      user: userId,
      status: { $in: ['open', 'accepted'] },
    });
    const user = await UserService.findUserById(userId);
    let responseHelpSeeker = [];
    for (const request of activeRequests) {
      const response = await RequestService.findResponseForRequest(request);
      let result = await this.getActiveRequestResponseFormat(
        request,
        response,
        false
      );
      result['phoneHelpSeeker'] = user.phone;
      responseHelpSeeker.push(result);
    }
    return responseHelpSeeker;
  }

  static async getActiveRequestHelper(userId) {
    const activeResponse = await models.Response.findOne({
      user: userId,
      status: { $in: ['accepted', 'called', 'on-the-way'] },
    });
    let responseHelper = null;
    if (activeResponse) {
      const process = await models.Process.findOne({
        _id: activeResponse.process,
      });
      const request = await models.Request.findOne({
        _id: process.requests[process.requests.length - 1],
      });
      responseHelper = await this.getActiveRequestResponseFormat(
        request,
        activeResponse,
        true
      );
    }
    return responseHelper;
  }

  static async getActiveRequestResponseFormat(request, response, isHelper) {
    let result = {
      _id: request._id,
      process: request.process,
      status: isHelper ? response.status : request.status,
      urgency: request.urgency,
      requestType: request.requestType,
      extras: request.extras,
      address: await AddressService.prepareAddressResponse(
        await models.Address.findOne({ _id: request.address })
      ),
      startedAt: isHelper ? response.createdAt : request.log.get('open'),
    };
    if (isHelper) {
      if (response.status === 'accepted') {
        delete result.address.houseNumber;
      }
      result['name'] = request.name;
    } else {
      if (response) {
        const helper = await UserService.findUserById(response.user);
        result['phoneHelper'] = helper.phone;
        result['name'] = helper.profile.name;
      }
    }
    return result;
  }

  static async getFinishedRequests(userId) {
    return {
      helpSeeker: await this.getFinishedRequestsHelpSeeker(userId),
      helper: await this.getFinishedRequestsHelper(userId),
    };
  }

  static async getFinishedRequestsHelpSeeker(userId) {
    const finishedRequests = await models.Request.find({
      user: userId,
      status: { $in: ['done', 'reopened', 'aborted'] },
    });
    let responseFinishedRequests = [];
    for (const request of finishedRequests) {
      const response = await RequestService.findResponseForRequest(request);
      responseFinishedRequests.push(
        await this.getFinishedRequestResponseFormat(request, response, false)
      );
    }
    return responseFinishedRequests;
  }

  static async getFinishedRequestsHelper(userId) {
    const finishedResponses = await models.Response.find({
      user: userId,
      status: { $in: ['done', 'aborted', 'did-not-help'] },
    });
    let responseFinishedRequests = [];
    for (const response of finishedResponses) {
      const process = await models.Process.findOne({ _id: response.process });
      const request = await models.Request.findOne({
        _id: process.requests[process.requests.length - 1],
      });
      responseFinishedRequests.push(
        await this.getFinishedRequestResponseFormat(request, response, true)
      );
    }
    return responseFinishedRequests;
  }

  static async getFinishedRequestResponseFormat(request, response, isHelper) {
    let result = {
      status: isHelper ? response.status : request.status,
      urgency: request.urgency,
      requestType: request.requestType,
      extras: request.extras,
      startedAt: isHelper ? response.createdAt : request.log.get('open'),
      finishedAt: isHelper
        ? response.log.get(response.status)
        : request.log.get(request.status),
    };
    if (isHelper) {
      result['name'] = request.name;
    } else {
      result['address'] = await AddressService.prepareAddressResponse(
        await models.Address.findOne({ _id: request.address })
      );
      if (response) {
        const helper = await UserService.findUserById(response.user);
        result['name'] = helper.profile.name;
      }
    }
    return result;
  }
}
