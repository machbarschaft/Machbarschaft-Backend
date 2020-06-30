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
      console.log('user.access');
      const access = await models.Access.findById(user.access);
      console.log(access);
      if (access.confirmEmail.length) {
        console.log('access.confirmEmail.length');
        const confirmEmail = await models.ConfirmEmail.findById(
          access.confirmEmail[access.confirmEmail.length - 1]
        );
        if (confirmEmail.expiresAt < Date.now()) {
          console.log('confirmEmail.expiresAt');
          const confirmEmailCreated = AuthService.createConfirmEmail(
            access._id,
            access.email
          );
          var token = confirmEmailCreated.token;
          console.log(token);
        } else {
          var token = confirmEmail.token;
          console.log(token);
        }
      }
      if (!access.confirmEmail.length) {
        console.log('!access.confirmEmail.length');
        const confirmEmailCreated = AuthService.createConfirmEmail(
          access._id,
          access.email
        );
        var token = confirmEmailCreated.token;
        console.log(token);
      }
      let subject = 'Bitte bestätige dein Konto';
      let to = access.email;
      let from = process.env.FROM_EMAIL;
      let link = 'http://' + process.env.URL + '/auth/verify/' + token;
      let html = `<p>Lieber User, <p><br><p>bitte klicke auf folgenden <a href="${link}">Link</a>, um dein Konto zu verifizieren.</p> 
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
