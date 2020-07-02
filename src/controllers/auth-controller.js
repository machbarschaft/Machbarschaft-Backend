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

const verify = async (req, res) => {
  AuthService.verify(req.params.token)
    .then((result) => {
      res.status(200).json(result);
      return;
    })
    .catch((error) => {
      if (error.message === 'Wrong token.') {
        res.status(401).send({ errors: error.message });
        return;
      }
      console.log(error);
      res.status(500).send();
      return;
    });
  return;
};

const resendEmail = async (req, res) => {
  AuthService.sendVerificationEmail(req.body.email)
    .then((result) => {
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

// trigger email to generate token and send email with password reset link to user

const sendResetPassword = async (req, res) => {
  AuthService.sendResetPasswordEmail(req.body.email)
    .then((result) => {
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

// change password itself

const resetPassword = async (req, res) => {
  AuthService.resetPasswordInAccess(req.params.token, req.body.password)
    .then((result) => {
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

// verify if password reset token is correct

const verifyResetPassword = async (req, res) => {
  AuthService.verifyPasswordToken(req.params.token)
    .then((result) => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send();
      return;
    });
  return;
};

const changePassword = async (req, res) => {
  UserService.findUserById(req.user.uid)
    .then((user) => {
      return AuthService.changePassword(
        user.access,
        req.body.oldPassword,
        req.body.newPassword
      );
    })
    .then((result) => {
      res.status(200).send();
      return;
    })
    .catch((error) => {
      if (error.message === 'Password or username is incorrect') {
        res.status(401).send(error.message);
        return;
      }
      if (
        error.message === 'User not found.' ||
        error.message === 'Access not found.'
      ) {
        res.status(404).send(error.message);
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

module.exports = {
  register,
  login,
  logout,
  authenticate,
  resendEmail,
  verify,
  verifyResetPassword,
  sendResetPassword,
  resetPassword,
  changePassword,
};
