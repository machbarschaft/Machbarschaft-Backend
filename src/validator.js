const { body, validationResult, header } = require('express-validator');
const userValidationRules = () => {
  return [
    // username must be an email
    body('email').exists().isEmail(),
    // password must be at least 5 chars long
    body('password').exists().isLength({ min: 5 }),
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
};
