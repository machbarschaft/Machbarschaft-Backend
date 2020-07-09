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

module.exports = {
  updateProfile,
};
