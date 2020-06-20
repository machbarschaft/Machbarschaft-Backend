'use strict';

import models from '../models/bundle';
import JWTConfig from '../jwt_config';
import jwt from 'jsonwebtoken';

export default class AuthService {
  static async register(email, password) {
    const access = await models.Access.findOne({
      email: email,
    });
    if (access) {
      return Promise.reject(new Error('user already exists'));
    }

    return models.Access.register(
      new models.Access({
        email: email,
      }),
      password
    );
  }

  static async login(userId) {
    // Create and sign json web token with the user as payload
    return jwt.sign(
      {
        user: {
          uid: userId,
        },
      },
      JWTConfig.jwtSecret(),
      JWTConfig.jwtOptions(JWTConfig.AuthenticationType.login)
    );
  }

  static async logout(userId) {
    const access = await models.Access.findOne({ _id: userId });
    if (access) {
      return jwt.sign(
        {
          user: {
            uid: userId,
          },
        },
        JWTConfig.jwtSecret(),
        JWTConfig.jwtOptions(JWTConfig.AuthenticationType.logout)
      );
    } else {
      return Promise.reject(new Error('Could not find user with given id.'));
    }
  }

  static async authenticate(userId) {
    const access = await models.Access.findOne({ _id: userId });
    if (access) {
      return Promise.resolve({
        uid: access._id,
        email: access.email,
      });
    } else {
      return Promise.reject(new Error('Could not find user with given id.'));
    }
  }
}
