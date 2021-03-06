import PhoneService from '../services/phone-service';
import UserService from '../services/user-service';
import RequestService from '../services/request-service';
import ProcessService from '../services/process-service';
import ResponseService from '../services/response-service';

import APIError from '../errors';

const createNewTan = async (req, res) => {
  let user;
  if (req.body.userId) {
    user = await UserService.findUserById(req.body.userId);
  } else {
    user = await UserService.findUserByPhone(
      req.body.countryCode,
      req.body.phone
    );
  }
  if (!user) {
    res
      .status(404)
      .send('Es gibt keinen Benutzer mit der gegebenen ID/Telefonnummer.');
    return;
  }
  PhoneService.create(user._id, user.countryCode, user.phone, req.body.sms)
    .then(() => {
      res.status(201).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const confirmTan = async (req, res) => {
  let userId;
  if (req.body.userId) {
    userId = req.body.userId;
  } else {
    const user = await UserService.findUserByPhone(
      req.body.countryCode,
      req.body.phone
    );
    userId = user._id;
  }
  PhoneService.confirm(req.body.tan, userId)
    .then((phoneNumber) => {
      const options = {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: true,
        secure: process.env.CORS_ENV !== 'development',
      };

      res.cookie('machbarschaft_phoneVerified', phoneNumber, options);

      res.status(200).json(phoneNumber);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const setCalled = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    if (req.body.status === 'completed') {
      const countryCode = req.body.phone.substring(1, 3);
      const phone = req.body.phone.substring(3);
      UserService.findUserByPhone(countryCode, phone)
        .then((user) => {
          return ResponseService.findActiveResponseByUserId(user._id);
        })
        .then((response) => {
          return ResponseService.updateResponse(response._id, 'called').then(
            () => {
              res.status(200).send();
            }
          );
        })
        .catch((error) => {
          // Twilio calls this endpoint whenever helper calls helpseeker
          // Only on first call the status should be updated
          // All other calls the status is intentionally not updated, but this is also not an error for twilio
          if (error.message === 'Ungültiger Status.') {
            res.status(200).send();
            return;
          }
          APIError.handleError(error, res);
        });
    } else {
      // If the call was not answered by the help seeker, the status does not need to update
      res.status(200).send();
    }
  } else {
    res.status(401).send('Unauthorized.');
  }
};

const findNumber = async (req, res) => {
  if (req.body.secret.toString() === process.env.TWILIO_SECRET) {
    let helperName = '';
    let helpSeekerName = '';
    const countryCode = req.body.phone.substring(1, 3);
    const phone = req.body.phone.substring(3);
    UserService.findUserByPhone(countryCode, phone)
      .then((user) => {
        helperName = user.profile.name;
        return ResponseService.findActiveResponseByUserId(user._id);
      })
      .then((response) => {
        return ProcessService.getProcess(response.process);
      })
      .then((process) => {
        return RequestService.getRequest(
          process.requests[process.requests.length - 1]
        );
      })
      .then((request) => {
        helpSeekerName = request.name;
        return UserService.findUserById(request.user);
      })
      .then((user) => {
        res.status(200).json({
          phone: `+${user.countryCode.toString()}${user.phone.toString()}`,
          helpSeekerName,
          helperName,
        });
      })
      .catch((error) => {
        APIError.handleError(error, res);
      });
  } else {
    res.status(401).send('Unauthorized.');
  }
};

module.exports = { createNewTan, confirmTan, findNumber, setCalled };
