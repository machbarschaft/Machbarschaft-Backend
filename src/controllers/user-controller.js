import UserService from '../services/user-service';
import APIError from '../errors';

const updateProfile = async (req, res) => {
  UserService.updateProfile(req.user.uid, req.body.forename, req.body.surname)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const getPreferences = async (req, res) => {
  UserService.getPreferences(req.user.uid)
    .then((preferences) => {
      res.status(200).json(preferences);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const setPreferences = async (req, res) => {
  UserService.setPreferences(req.user.uid, req.body)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  updateProfile,
  getPreferences,
  setPreferences,
};
