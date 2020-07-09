'use strict';

import UserService from '../services/user-service';

const updateProfile = async (req, res) => {
  UserService.updateProfile(req.user.uid, req.body.forename, req.body.surname)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (error.message === 'Could not find user with given id.') {
        res.status(404).send(error.message);
        return;
      }
      console.log(error);
      res.status(500).send();
      return;
    });
};

const getPreferences = async (req, res) => {
  UserService.getPreferences(req.user.uid)
    .then((preferences) => {
      res.status(200).json(preferences);
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const setPreferences = async (req, res) => {
  UserService.setPreferences(req.user.uid, req.body)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (error.message === 'Unable to validate exact address.') {
        res.status(400).send(error.message);
        return;
      }
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

module.exports = {
  updateProfile,
  getPreferences,
  setPreferences,
};
