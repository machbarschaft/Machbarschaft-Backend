'use strict';

import PreferenceService from '../services/preference-service';

const getPreferences = async (req, res) => {
  PreferenceService.getPreferences(req.user.uid)
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
  PreferenceService.setPreferences(req.user.uid, req.body)
    .then(() => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

module.exports = {
  getPreferences,
  setPreferences
};
