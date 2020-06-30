'use strict';

import models from '../models/bundle';
import JWTConfig from '../jwt_config';
import jwt from 'jsonwebtoken';
import UserService from './user-service';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class AuthService {
  static async register(email, password, phone) {
    console.log(phone);
    let user = await UserService.findUserByPhone(phone);
    let access = await models.Access.findOne({
      email: email,
    });
    if (access) {
      return Promise.reject(
        new Error('this email address is already assigned to an account')
      );
    }
    console.log(user);
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
      console.log(result);
      user.access = result._id;
      user.save();
      console.log(user._id);
      AuthService.sendVerificationEmail(user._id);
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

  static async createConfirmEmail(accessId, email) {
    var token = crypto.randomBytes(20).toString('hex');
    const confirmEmail = new models.ConfirmEmail({
      access: accessId,
      email: email,
      token: token,
    });
    confirmEmail.save();
    const access = await models.Access.findById(accessId);
    access.confirmEmail.push(confirmEmail._id);
    access.save();
    return confirmEmail;
  }

  static async resetPasswordInAccess(token, password) {
    const resetPassword = await models.ResetPassword.findOne({ token: token });
    resetPassword.processCompleted = false;
    if (resetPassword && resetPassword.processCompleted === false) {
      resetPassword.processCompleted = true;
      resetPassword.save();
      models.Access.findOne(
        {
          resetPassword: resetPassword._id,
        },
        function (access) {
          access.setPassword(password, function (access) {
            access.save();
          });
          return access;
        }
      );
    } else return Promise.reject(new Error('Wrong token or already done.'));
  }

  static async verifyPasswordToken(token) {
    const resetPassword = await models.ResetPassword.findOne({ token: token });
    if (!resetPassword) {
      return Promise.reject(new Error('Wrong token.'));
    }
    return Promise.resolve();
  }

  static async verify(token) {
    const confirmEmail = await models.ConfirmEmail.findOne({ token: token });
    if (!confirmEmail) return Promise.reject(new Error('Wrong token.'));
    const access = await models.Access.findById(confirmEmail.access);
    access.emailVerified = true;
    access.save();
    return Promise.resolve();
  }

  static async sendVerificationEmail(userId) {
    const user = await models.User.findById(userId);
    if (user.access) {
      const access = await models.Access.findById(user.access);
      if (access.confirmEmail.length) {
        const confirmEmail = await models.ConfirmEmail.findById(
          access.confirmEmail[access.confirmEmail.length - 1]
        );
        if (confirmEmail.expiresAt < Date.now()) {
          const confirmEmailCreated = await this.createConfirmEmail(
            access._id,
            access.email
          );
          var token = confirmEmailCreated.token;
        } else {
          var token = confirmEmail.token;
        }
      }
      if (!access.confirmEmail.length) {
        const confirmEmailCreated = await this.createConfirmEmail(
          access._id,
          access.email
        );
        var token = confirmEmailCreated.token;
      }
      let subject = 'Bitte bestätige dein Konto';
      let to = access.email;
      let from = process.env.FROM_EMAIL;
      let link = 'http://' + process.env.URL + '/auth/verify/' + token;
      let html = `<p>Lieber User, <p><br><p>bitte klicke auf folgenden <a href="${link}">Link</a>, um dein Konto zu verifizieren.</p> 
                    <br><p>Deine Machbarschaft.</p>`;

      await this.sendEmail({ to, from, subject, html });

      return Promise.resolve();
    } else {
      return Promise.reject(new Error('No access found for given user.'));
    }
  }

  static async createResetPassword(accessId) {
    var token = crypto.randomBytes(20).toString('hex');
    const resetPassword = new models.ResetPassword({
      access: accessId,
      token: token,
    });
    resetPassword.save();
    const access = await models.Access.findById(accessId);
    access.resetPassword.push(resetPassword._id);
    access.save();
    return resetPassword;
  }

  static async sendResetPasswordEmail(email) {
    const access = await models.Access.findOne({ email: email });
    if (access) {
      if (access.resetPassword.length) {
        const resetPassword = await models.ResetPassword.findById(
          access.resetPassword[access.resetPassword.length - 1]
        );
        if (resetPassword.processCompleted === true) {
          const resetPasswordCreated = this.createResetPassword(access._id);
          var token = resetPasswordCreated.token;
        } else {
          var token = resetPassword.token;
        }
      }
      if (!access.resetPassword.length) {
        const resetPasswordCreated = await this.createResetPassword(access._id);
        var token = resetPasswordCreated.token;
      }
      let subject = 'Passwort zurücksetzen';
      let to = access.email;
      let from = process.env.FROM_EMAIL;
      let link =
        'http://' + process.env.URL + '/auth/verifyResetPassword/' + token;
      let html = `<p>Lieber User, <p><br><p>bitte klicke auf folgenden <a href="${link}">Link</a>, um dein Passwort zurückzusetzen.</p> 
                    <br><p>Deine Machbarschaft.</p>`;

      await AuthService.sendEmail({ to, from, subject, html });

      return Promise.resolve();
    } else {
      return Promise.reject(new Error('No access found for given user.'));
    }
  }

  static async sendEmail(mailOptions) {
    return new Promise((resolve, reject) => {
      sgMail.send(mailOptions, (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      });
    });
  }
}
