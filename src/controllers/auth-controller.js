'use strict';

import models from '../models/bundle';
import AuthService from '../services/auth-service';
import { validationResult } from 'express-validator';
import JWTConfig from '../jwt_config';
import jwt from 'jsonwebtoken';
import UserService from '../services/user-service';

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  AuthService.register(req.body.email, req.body.password, req.body.phone)
    .then((result) => {
      res.status(201).send();
      return;
    })
    .catch((error) => {
      if (
        error.message ===
          'this email address is already assigned to an account' ||
        error.message === 'for this phone number exists a registered account'
      ) {
        res.status(401).send({ errors: error.message });
        return;
      }
      console.log(error);
      res.status(500).send({ errors: 'internal server error' });
      return;
    });
  return;
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const verifiedUser = await UserService.isVerified(req.user.user);
  AuthService.login(req.user.user)
    .then((token) => {
      // Send the Set-Cookie header with the jwt to the client
      res.cookie(
        'jwt',
        token,
        JWTConfig.jwtCookie(JWTConfig.AuthenticationType.login)
      );
      res.status(200).send();
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
      return;
    });
};

const logout = async (req, res) => {
  AuthService.logout(req.user.uid)
    .then((token) => {
      // Send the Set-Cookie header with the jwt to the client
      res.cookie(
        'jwt',
        token,
        JWTConfig.jwtCookie(JWTConfig.AuthenticationType.logout)
      );
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

const authenticate = async (req, res) => {
  AuthService.authenticate(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

module.exports = { register, login, logout, authenticate };
