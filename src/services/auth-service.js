import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import models from '../models/bundle';
import JWTConfig from '../config/jwt-config';
import UserService from './user-service';
import AddressService from './address-service';
import APIError from '../errors';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default class AuthService {
  static async register(email, password, countryCode, phone, profile) {
    let user = await UserService.findUserByPhone(countryCode, phone);
    let access = await models.Access.findOne({
      email,
    });
    if (access) {
      return Promise.reject(
        new APIError(400, 'Diese Emailadresse ist bereits registriert.')
      );
    }
    if (user) {
      if (user.access) {
        return Promise.reject(
          new APIError(
            400,
            'Diese Telefonnummer ist bereits mit einem Konto verbunden.'
          )
        );
      }
      user.profile = profile;
    } else {
      user = await UserService.createUser(countryCode, phone, profile);
    }

    access = new models.Access({
      user: user._id,
      email,
    });

    return models.Access.register(access, password).then((result) => {
      user.access = result._id;
      return user.save().then((user) => {
        return AuthService.sendVerificationEmail(user._id);
      });
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
    }
    return Promise.reject(
      new APIError(
        404,
        'Es konnte kein Benutzer mit der gegebenen ID ermittelt werden.'
      )
    );
  }

  static async authenticate(userId) {
    const access = await models.Access.findOne({ user: userId });
    const user = await models.User.findOne({ _id: userId });
    if (access && user) {
      let addressResponse = null;
      if (user.preferences.staticPosition) {
        const fullAddress = await models.Address.findOne({
          _id: user.preferences.staticPosition,
        });
        addressResponse = await AddressService.prepareAddressResponse(
          fullAddress
        );
      }
      return Promise.resolve({
        uid: access.user,
        email: access.email,
        countryCode: user.countryCode,
        phone: user.phone,
        emailVerified: access.emailVerified,
        phoneVerified: user.phoneVerified,
        profile: user.profile ? user.profile : null,
        address: addressResponse,
      });
    }
    return Promise.reject(
      new APIError(
        404,
        'Es konnte kein Benutzer mit der gegebenen ID ermittelt werden.'
      )
    );
  }

  static async createConfirmEmail(accessId, email) {
    const token = crypto.randomBytes(20).toString('hex');
    const confirmEmail = new models.ConfirmEmail({
      access: accessId,
      email,
      token,
    });
    confirmEmail.save();
    const access = await models.Access.findById(accessId);
    access.confirmEmail.push(confirmEmail._id);
    access.save();
    return confirmEmail;
  }

  static async resetPasswordInAccess(token, password) {
    const resetPassword = await models.ResetPassword.findOne({ token });
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
    } else
      return Promise.reject(
        new APIError(400, 'Das Token ist falsch oder wurde bereits genutzt.')
      );
  }

  static async changePassword(accessId, oldPassword, newPassword) {
    const access = await models.Access.findById(accessId);
    if (!access)
      return Promise.reject(new APIError(404, 'Keine Zugangsdaten gefunden.'));
    await access.changePassword(oldPassword, newPassword);
    return Promise.resolve();
  }

  static async verifyPasswordToken(token) {
    const resetPassword = await models.ResetPassword.findOne({ token });
    if (!resetPassword) {
      return Promise.reject(new APIError(400, 'Ungültiges Token.'));
    }
    return Promise.resolve();
  }

  static async verify(token) {
    const confirmEmail = await models.ConfirmEmail.findOne({ token });
    if (!confirmEmail)
      return Promise.reject(new APIError(400, 'Ungültiges Token.'));
    const access = await models.Access.findById(confirmEmail.access);
    access.emailVerified = true;
    if (confirmEmail.email !== access.email) {
      access.email = confirmEmail.email;
    }
    access.save();
    return Promise.resolve();
  }

  static async sendVerificationEmail(userId) {
    const user = await models.User.findById(userId);
    if (user.access) {
      const access = await models.Access.findById(user.access);
      let token;
      if (!access.confirmEmail.length) {
        const confirmEmailCreated = await this.createConfirmEmail(
          access._id,
          access.email
        );
        token = confirmEmailCreated.token;
      } else {
        const confirmEmail = await models.ConfirmEmail.findById(
          access.confirmEmail[access.confirmEmail.length - 1]
        );
        if (confirmEmail.expiresAt < Date.now()) {
          const confirmEmailCreated = await this.createConfirmEmail(
            access._id,
            access.email
          );
          token = confirmEmailCreated.token;
        } else {
          token = confirmEmail.token;
        }
      }
      const subject = 'Bitte bestätigen Sie Ihr Konto';
      const to = access.email;
      const from = process.env.FROM_EMAIL;
      const link = `${process.env.URL}/email-bestaetigen?token=${token}`;
      const html = `<p>Hallo ${user.profile.name}, <p><br><p>bitte klicken Sie auf folgenden <a href="${link}">Link</a>, um Ihr Konto zu verifizieren. Falls Sie diesen Link nicht aufrufen können, benutzen Sie folgende URL und kopieren Sie diese in den Browser:</p> 
                    <br><p><a href="${link}">${link}</a></p><br>
                    <p>Ihre Machbarschaft.</p>`;

      await this.sendEmail({ to, from, subject, html });

      return Promise.resolve();
    }
    return Promise.reject(
      new APIError(
        404,
        'Für diesen Benutzer wurden keine Zugangsdaten gefunden.'
      )
    );
  }

  static async createResetPassword(accessId) {
    const token = crypto.randomBytes(20).toString('hex');
    const resetPassword = new models.ResetPassword({
      access: accessId,
      token,
    });
    resetPassword.save();
    const access = await models.Access.findById(accessId);
    access.resetPassword.push(resetPassword._id);
    access.save();
    return resetPassword;
  }

  static async sendResetPasswordEmail(email) {
    const access = await models.Access.findOne({ email });
    if (access) {
      if (access.resetPassword.length) {
        const resetPassword = await models.ResetPassword.findById(
          access.resetPassword[access.resetPassword.length - 1]
        );
        if (resetPassword.processCompleted === true) {
          const resetPasswordCreated = this.createResetPassword(access._id);
          var { token } = resetPasswordCreated;
        } else {
          var { token } = resetPassword;
        }
      }
      if (!access.resetPassword.length) {
        const resetPasswordCreated = await this.createResetPassword(access._id);
        var { token } = resetPasswordCreated;
      }
      const user = await models.User.findById(access.user);
      const subject = 'Passwort zurücksetzen';
      const to = access.email;
      const from = process.env.FROM_EMAIL;
      const link = `${process.env.URL}/auth/verifyResetPassword?token=${token}`;
      const html = `<p>Hallo ${user.profile.name}, <p><br><p>bitte klicken Sie auf folgenden <a href="${link}">Link</a>, um Ihr Passwort zurückzusetzen. Falls Sie diesen Link nicht aufrufen können, benutzen Sie folgende URL und kopieren Sie diese in den Browser:</p> 
                  <br><p><a href="${link}">${link}</a></p><br>
                  <p>Ihre Machbarschaft.</p>`;
      await AuthService.sendEmail({ to, from, subject, html });

      return Promise.resolve();
    }
    return Promise.reject(
      new APIError(
        404,
        'Für diesen Benutzer wurden keine Zugangsdaten gefunden.'
      )
    );
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
