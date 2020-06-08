'use strict';

import CustomJoi from '../joi/custom-joi';
import { createSchema } from '../joi/user-schema';
import UserService from '../services/user-service';

const create = async (req, res) => {
  CustomJoi.validate(req.body, createSchema, (err, result) => {
    if (err) {
      res.status(400).json({
        error: 'Bad Request',
        message: err,
      });
    }
    UserService.createUser(result.phone)
      .then((userId) => {
        res.status(200).json({ userId: userId });
      })
      .catch((err) => {
        res.status(500).json({
          error: 'Internal Server Error',
          message: err,
        });
      });
  });
};

const UserController = { create };

export default UserController;
