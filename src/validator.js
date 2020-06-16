import { colors } from './models/example';

const { body, validationResult, header, oneOf } = require('express-validator');

const userValidationRules = () => {
  return [
    // username must be an email
    body('email')
      .exists()
      .withMessage('Es muss eine E-Mail-Adresse angegeben werden.')
      .isEmail()
      .withMessage(
        'Die E-Mail-Adresse muss im E-Mail-Format angegeben werden.'
      ),
    // password must be at least 5 chars long
    body('password')
      .exists()
      .withMessage('Ein Passwort muss angegeben werden')
      .isLength({ min: 5 })
      .withMessage('Das Passwort muss mindestens 5 Zeichen lang sein.'),
  ];
};

const requireUserIdOrPhoneNumber = () => {
  return oneOf([
    body('user')
      .exists()
      .isLength({ min: 24, max: 24 })
      .isLowercase()
      .isAlphanumeric(),
    body('phone').exists().isMobilePhone('de-DE'),
  ]);
};

const tanValidationRules = () => {
  return [body('tan').exists().isNumeric().isLength({ min: 4, max: 4 })];
};

const cookieValidationRules = () => {
  return [header('cookie').exists().contains('jwt')];
};

const exampleValidationRules = () => {
  return [
    body('name', 'The name must only contain letters.').isAlpha(),
    body(
      'color',
      'The color attribute is required, and consists of letters only.'
    )
      .exists()
      .isAlpha()
      .custom((value) => {
        const result = colors.find((element) => element === value);
        if (!result) {
          return Promise.reject('No valid color.');
        }
        return Promise.resolve();
      }),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  userValidationRules,
  tanValidationRules,
  requireUserIdOrPhoneNumber,
  validate,
  cookieValidationRules,
  exampleValidationRules,
};
