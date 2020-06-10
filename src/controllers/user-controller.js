'use strict';

import UserService from '../services/user-service';

const create = async (req, res) => {
  UserService.createUser(req.body.phone)
    .then((user) => {
      res.status(200).json({ userId: user._id });
    })
    .catch((error) => {
      if (error === 'User already exists.') {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User already exists.',
        });
        return;
      }
      res.status(500).send();
      console.log(error);
    });
};

module.exports = { create };
