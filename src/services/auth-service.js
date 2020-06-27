'use strict';

import models from '../models/bundle';
import JWTConfig from '../jwt_config';
import jwt from 'jsonwebtoken';
import UserService from './user-service';

export default class AuthService {
  static async register(email, password, phone) {
    let user = await UserService.findUserByPhone(phone);
    let access = await models.Access.findOne({
      email: email,
    });
    if (access) {
      return Promise.reject(
        new Error('this email address is already assigned to an account')
      );
    }
    if (user) {
      if (user.access) {
        return Promise.reject(
          new Error('for this phone number exists a registered account')
        );
      }
    } else {
      user = await UserService.createUser(phone);
    }

    access = new models.Access({
      user: user._id,
      email: email,
    });

    return models.Access.register(access, password).then((result) => {
      user.access = result._id;
      user.save();
      return Promise.resolve();
    });
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
    const access = await models.Access.findOne({ user: userId });
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
    const access = await models.Access.findOne({ user: userId });
    if (access) {
      return Promise.resolve({
        uid: access.user,
        email: access.email,
      });
    } else {
      return Promise.reject(new Error('Could not find user with given id.'));
    }
  }
}
