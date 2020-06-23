const { body, validationResult, header, param } = require('express-validator');
const loginValidationRules = () => {
  return [
    // username must be an email
    body(
      'email',
      'Die Email muss angegeben werden und ein gültiges Format haben'
    ).isEmail(),

    // password must be at least 5 chars long
    body(
      'password',
      'Das Passwort muss angegeben werden und ein gültiges Format haben'
    ).isLength({ min: 5 }),
  ];
};
const idValidationRules = () => {
  return [
    param('processId')
      .exists()
      .withMessage('Die processId muss angegeben werden')
      .isMongoId()
      .withMessage('Die processId ist falsch'),
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
  loginValidationRules,
  validate,
  cookieValidationRules,
  idValidationRules,
};
