import jwt from 'jsonwebtoken';
import AuthService from '../services/auth-service';
import JWTConfig from '../jwt_config';
import UserService from '../services/user-service';
import APIError from '../errors';

const register = async (req, res) => {
  const profile = { forename: req.body.forename, surname: req.body.surname };
  AuthService.register(
    req.body.email,
    req.body.password,
    req.body.countryCode,
    req.body.phone,
    profile
  )
    .then(() => {
      res.status(201).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const login = async (req, res) => {
  AuthService.login(req.user.user)
    .then((token) => {
      // Send the Set-Cookie header with the jwt to the client
      res.cookie(
        'jwt',
        token,
        JWTConfig.jwtCookie(JWTConfig.AuthenticationType.login)
      );
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
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
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const authenticate = async (req, res) => {
  AuthService.authenticate(req.user.uid)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const verify = async (req, res) => {
  AuthService.verify(req.params.token)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const resendEmail = async (req, res) => {
  AuthService.sendVerificationEmail(req.user.uid)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

// trigger email to generate token and send email with password reset link to user

const sendResetPassword = async (req, res) => {
  AuthService.sendResetPasswordEmail(req.body.email)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

// change password itself

const resetPassword = async (req, res) => {
  AuthService.resetPasswordInAccess(req.params.token, req.body.password)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

// verify if password reset token is correct

const verifyResetPassword = async (req, res) => {
  AuthService.verifyPasswordToken(req.params.token)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
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
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
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
