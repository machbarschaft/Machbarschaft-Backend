'use strict';

import models from '../models/bundle';
import AddressService from './address-service';

export default class DashboardService {
  static async getActiveRequests(userId) {
    const activeRequests = await models.Request.find({
      user: userId,
      status: { $in: ['open', 'accepted'] },
    });
    const user = await models.User.findOne({ _id: userId });
    let result = [];
    for (const request of activeRequests) {
      result.push({
        name: request.name,
        phone: user.phone,
        status: request.status,
        urgency: request.urgency,
        requestType: request.requestType,
        extras: request.extras ? request.extras : null,
        address: await AddressService.prepareAddressResponse(
          await models.Address.findOne({ _id: request.address })
        ),
        startedAt: request.log.get('open'),
      });
    }
    return Promise.resolve(result);
  }

  static async getFinishedRequests(userId) {
    const finishedRequests = await models.Request.find({
      user: userId,
      status: { $in: ['done', 'reopened', 'aborted'] },
    });
    let result = [];
    for (const request of finishedRequests) {
      result.push({
        name: request.name,
        status: request.status,
        urgency: request.urgency,
        requestType: request.requestType,
        extras: request.extras ? request.extras : null,
        address: await AddressService.prepareAddressResponse(
          await models.Address.findOne({ _id: request.address })
        ),
        startedAt: request.log.get('open'),
        finishedAt: request.log.get(request.status),
      });
    }
    return Promise.resolve(result);
  }
}
