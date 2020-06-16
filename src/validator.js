const { body, validationResult, header, param } = require('express-validator');
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
const processValidationRules = () => {
  return [
    param('processId')
      .exists()
      .isLength({ min: 24, max: 24 })
      .isLowercase()
      .isAlphanumeric(),
  ];
};
const cookieValidationRules = () => {
  return [header('cookie').exists().contains('jwt')];
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
  validate,
  cookieValidationRules,
  processValidationRules,
};
