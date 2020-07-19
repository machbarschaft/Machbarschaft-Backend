import RequestService from '../services/request-service';
import UserService from '../services/user-service';
import APIError from '../errors';
import AddressService from '../services/address-service';

const createAndPublishTwilio = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    req.body.houseNumber = parseInt(req.body.houseNumber);
    req.body.zipCode = parseInt(req.body.zipCode);
    req.body.carNecessary =
      (req.body.carNecessary + '').toLowerCase() === 'true';
    if (req.body.prescriptionRequired === undefined)
      req.body.prescriptionRequired = false;
    req.body.prescriptionRequired =
      (req.body.prescriptionRequired + '').toLowerCase() === 'true';
    AddressService.createAddress(
      req.body.street,
      req.body.houseNumber,
      req.body.zipCode,
      req.body.city,
      req.body.country
    )
      .then((address) => {
        let name = req.body.name.split(' ');
        let forename = name[0];
        let surname = req.body.name.substring(name[0].length).trim();
        return RequestService.createByTwilio(
          req.body.phone.substring(1, 3),
          req.body.phone.substring(3),
          forename,
          surname,
          address._id,
          req.body.requestType,
          req.body.urgency,
          {
            carNecessary: req.body.carNecessary,
            prescriptionRequired: req.body.prescriptionRequired,
          }
        );
        return;
      })
      .then(() => {
        res.status(201).send();
        return;
      })
      .catch((error) => {
        console.log(error);
        APIError.handleError(error, res);
        return;
      });
  } else {
    res.status(401).send('Unauthorized.');
  }
  return;
};

const createLoggedIn = async (req, res) => {
  RequestService.createRequestWithUserId(req.user.uid)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const createLoggedOut = async (req, res) => {
  RequestService.createRequestWithPhone(req.query.countryCode, req.query.phone)
    .then((request) => {
      res.status(200).json({
        ...request,
        phoneVerifiedCookieMatch:
          req.cookies.machbarschaft_phoneVerified !== undefined &&
          req.cookies.machbarschaft_phoneVerified === req.query.phone,
      });
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const updateLoggedIn = async (req, res) => {
  RequestService.updateRequest(req.user.uid, req.params.reqId, req.body)
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const updateLoggedOut = async (req, res) => {
  UserService.findUserByPhone(req.query.countryCode, req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new APIError(
            404,
            'Es gibt keinen Benutzer mit der gegebenen Telefonnummer.'
          )
        );
      }
      return RequestService.updateRequest(user._id, req.params.reqId, req.body);
    })
    .then((request) => {
      res.status(200).json(request);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const publishLoggedIn = async (req, res) => {
  RequestService.publishRequest(req.user.uid, req.params.reqId)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const publishLoggedOut = async (req, res) => {
  if (req.cookies.machbarschaft_phoneVerified !== req.query.phone) {
    res.status(401).send('Die Telefonnummer ist nicht verifiziert.');
    return;
  }

  UserService.findUserByPhone(req.query.countryCode, req.query.phone)
    .then((user) => {
      if (!user) {
        return Promise.reject(
          new APIError(
            404,
            'Es gibt keinen Benutzer mit der gegebenen Telefonnummer.'
          )
        );
      }
      return RequestService.publishRequest(user._id, req.params.reqId);
    })
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const reopenRequest = async (req, res) => {
  RequestService.reopenRequest(req.user.uid, req.params.reqId)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

const getOpenRequestsNearby = async (req, res) => {
  RequestService.getOpenRequestsNearby(
    req.user.uid,
    req.query.latitude,
    req.query.longitude,
    req.query.radius
  )
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

module.exports = {
  createLoggedIn,
  createLoggedOut,
  updateLoggedIn,
  updateLoggedOut,
  publishLoggedIn,
  publishLoggedOut,
  createAndPublishTwilio,
  reopenRequest,
  getOpenRequestsNearby,
};
