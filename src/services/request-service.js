import models from '../models/bundle';
import { statusStages } from '../models/request-model';
import UserService from './user-service';
import ProcessService from './process-service';
import AddressService from './address-service';
import APIError from '../errors';

export default class RequestService {
  static async createRequestWithUserId(userId, authenticated) {
    let request = await models.Request.findOne({
      user: userId,
      status: statusStages[0],
    });
    if (request && authenticated) {
      return {
        _id: request._id,
        forename: request.forename ? request.forename : '',
        surname: request.surname ? request.surname : '',
        address: request.address
          ? await AddressService.prepareAddressResponse(
              await models.Address.findOne({ _id: request.address })
            )
          : { street: '', houseNumber: '', zipCode: '', city: '', country: '' },
        requestType: request.requestType ? request.requestType : '',
        urgency: request.urgency ? request.urgency : '',
        extras: request.extras,
      };
    }

    const process = await ProcessService.createProcess();
    request = new models.Request({
      process: process._id,
      user: userId,
      extras: new models.RequestExtras(),
    });
    process.requests.push(request._id);
    process.save();

    return this.prefillRequest(request, authenticated);
  }

  static async prefillRequest(request, authenticated) {
    let previousRequests;
    if (authenticated) {
      previousRequests = await models.Request.find({
        user: request.user,
      }).sort({
        createdAt: -1,
      });
    }

    if (authenticated && previousRequests.length) {
      request.forename = previousRequests[0].forename;
      request.surname = previousRequests[0].surname;
      request.address = previousRequests[0].address;
      request.requestType = previousRequests[0].requestType;
      request.urgency = previousRequests[0].urgency;
      request.extras = previousRequests[0].extras;
      await request.save();
      request._doc.address = await AddressService.prepareAddressResponse(
        await models.Address.findOne({ _id: request.address })
      );
      return Promise.resolve(request);
    }
    await request.save();
    return Promise.resolve({
      _id: request._id,
      forename: '',
      surname: '',
      address: {
        street: '',
        houseNumber: '',
        zipCode: '',
        city: '',
        country: '',
      },
      requestType: '',
      urgency: '',
      extras: request.extras,
    });
  }

  static async getRequest(requestId) {
    const request = await models.Request.findById(requestId);
    if (!request) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftrag mit der angegeben ID.')
      );
    }
    return request;
  }

  static async createRequestWithPhone(countryCode, phone, authenticated) {
    let user = await UserService.findUserByPhone(countryCode, phone);
    if (!user) {
      user = await UserService.createUser(countryCode, phone, null);
    }

    return this.createRequestWithUserId(user._id, authenticated);
  }

  static async updateRequest(userId, requestId, requestBody) {
    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftrag mit der angegeben ID.')
      );
    }

    if (request.user.toString() !== userId.toString()) {
      return Promise.reject(
        new APIError(403, 'Zugriff auf diesen Auftrag verweigert.')
      );
    }

    if (request.status !== statusStages[0]) {
      return Promise.reject(
        new APIError(400, 'Dieser Auftrag ist bereits veröffentlicht.')
      );
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
        return Promise.reject(
          new APIError(404, 'Es gibt keine Adresse mit der gegebenen ID.')
        );
      }
      if (!address.requests) {
        address.requests = [requestId];
      } else if (!address.requests.includes(requestId)) {
        address.requests.push(requestId);
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
    if (!(await UserService.isVerified(userId))) {
      return Promise.reject(
        new APIError(401, 'Die Telefonnummer ist noch nicht verifiziert.')
      );
    }

    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftrag mit der angegeben ID.')
      );
    }
    if (request.user.toString() !== userId.toString()) {
      return Promise.reject(
        new APIError(403, 'Zugriff auf diesen Auftrag verweigert.')
      );
    }
    if (request.status !== statusStages[0]) {
      return Promise.reject(
        new APIError(400, 'Der Auftrag ist bereits veröffentlicht.')
      );
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
      new APIError(
        400,
        'Der Auftrag beinhaltet nicht alle notwendigen Informationen.'
      )
    );
  }

  static async reopenRequest(userId, requestId) {
    const request = await models.Request.findOne({ _id: requestId });
    if (!request) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Auftrag mit der angegeben ID.')
      );
    }
    if (request.user.toString() !== userId) {
      return Promise.reject(
        new APIError(403, 'Zugriff auf diesen Auftrag verweigert.')
      );
    }

    if (request.status !== 'done') {
      return Promise.reject(
        new APIError(
          400,
          'Nur Aufträge mit dem Status "abgeschlossen", können wieder eröffnet werden.'
        )
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
        new APIError(
          400,
          'Aufträge können nur wieder eröffnet werden, wenn bereits Feedback gegeben wurde, dass der Auftrag nicht richtig ausgeführt wurde.'
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
      forename: request.forename,
      surname: request.surname,
      address: request.address,
      requestType: request.requestType,
      urgency: request.urgency,
      extras: request.extras,
    });
    newRequest.log.set('open', Date.now());

    return newRequest.save().then(async (request) => {
      const process = await models.Process.findOne({ _id: request.process });
      process.requests.push(request._id);
      return process.save();
    });
  }

  static async getOpenRequestsNearby(userId, currentLat, currentLng, radius) {
    const user = await UserService.findUserById(userId);
    if (!radius) {
      radius = user.preferences.radius;
    }
    if (!currentLat || !currentLng) {
      if (!user.preferences.staticPosition) {
        return Promise.reject(
          new APIError(
            400,
            'Es sind keine Daten zur aktuellen Position vorhanden.'
          )
        );
      }
      const address = await models.Address.findOne({
        _id: user.preferences.staticPosition,
      });
      currentLng = address.geoLocation.longitude;
      currentLat = address.geoLocation.latitude;
    }
    const openRequests = await models.Request.find({ status: 'open' });
    const result = [];
    for (const request of openRequests) {
      if (request.user.toString() === userId) {
        continue;
      }
      const requestAddress = await models.Address.findOne({
        _id: request.address,
      });
      const distance = this.calculateDistance(
        currentLat,
        currentLng,
        requestAddress.geoLocation.latitude,
        requestAddress.geoLocation.longitude
      );
      if (distance < radius) {
        const address = await models.Address.findOne({ _id: request.address });
        const addressResponse = await AddressService.prepareAddressResponse(
          address
        );
        delete addressResponse.houseNumber;
        addressResponse.geoLocation = address.geoLocation;
        result.push({
          _id: request._id,
          requestType: request.requestType,
          urgency: request.urgency,
          extras: request.extras,
          distance,
          address: addressResponse,
          process: request.process,
        });
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
    return d;
  }

  static async findResponseForRequest(request) {
    const process = await models.Process.findOne({ _id: request.process });
    let response;
    if (process.response && process.response.length) {
      response = await models.Response.findOne({
        _id: process.response[process.response.length - 1],
      });
    }
    return response;
  }

  static async createByTwilio(
    countryCode,
    phone,
    forename,
    surname,
    address,
    requestType,
    urgency,
    extras
  ) {
    return this.createRequestWithPhone(countryCode, phone)
      .then((requestFiltered) => {
        return this.getRequest(requestFiltered._id);
      })
      .then((request) => {
        request.forename = forename;
        request.surname = surname;
        request.address = address;
        request.requestType = requestType;
        request.urgency = urgency;
        request.extras = extras;
        request.status = 'open';
        request.log.set('open', Date.now());
        return request.save();
      });
  }

  static async updateStatus(userId, requestId, status) {
    return this.getRequest(requestId).then((request) => {
      if (request.user.toString() !== userId) {
        return Promise.reject(
          new APIError(401, 'Zugriff auf diesen Auftrag verweigert.')
        );
      }
      if (status === 'abort' && request.status !== 'open') {
        return Promise.reject(
          new APIError(
            403,
            'Der Auftrag ist nicht offen. Keine Stornierung mehr möglich.'
          )
        );
      }
      if (request.log.get(status) !== undefined) {
        return Promise.reject(
          new APIError(
            400,
            `Jeder Status kann nur ein Mal durchlaufen werden. Dieser Auftrag hatte bereits den Status: ${status}`
          )
        );
      }
      request.status = status;
      request.log.set(status, Date.now());
      return request.save();
    });
  }
}
