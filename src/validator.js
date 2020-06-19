import { requestTypes, urgencyCategories } from './models/request';

const {
  check,
  body,
  validationResult,
  header,
  oneOf,
} = require('express-validator');

const userValidationRules = () => {
  return [
    // username must be an email
    body(
      'email',
      'Die E-Mail-Adresse muss im E-Mail-Format angegeben werden.'
    ).isEmail(),
    // password must be at least 5 chars long
    body(
      'password',
      'Das Passwort muss mindestens 5 Zeichen lang sein.'
    ).isLength({ min: 5 }),
  ];
};

const requireUserIdOrPhoneNumber = () => {
  return oneOf(phoneValidationRules().concat(idValidationRules('userId')));
};

const idValidationRules = (fieldName) => {
  return [
    check(
      fieldName,
      'Die ID muss aus 24 Kleinbuchstaben und Zahlen bestehen.'
    ).isMongoId(),
    /*.isLength({ min: 24, max: 24 })
      .isLowercase()
      .isAlphanumeric(),*/
  ];
};

const phoneValidationRules = () => {
  return [
    check(
      'phone',
      'Die Telefonnummer muss eine gültige deutsche Telefonnummer sein.'
    ).isMobilePhone('de-DE'),
  ];
};

const requestValidationRules = () => {
  return [
    body(
      'requestType',
      'Der Auftragstyp darf nur folgende Werte haben: ' +
        requestTypes.toString()
    )
      .optional()
      .isIn(requestTypes),
    body(
      'urgency',
      'Die Dringlichkeit kann nur folgende Werte haben: ' +
        urgencyCategories.toString()
    )
      .optional()
      .isIn(urgencyCategories),
    body('carNecessary', "Darf nur 'true' oder 'false' sein.")
      .optional()
      .isBoolean(),
    body('prescriptionRequired', "Darf nur 'true' oder 'false' sein.")
      .optional()
      .isBoolean(),
  ]
    .concat(nameValidationRules())
    .concat(idValidationRules('addressId'));
};

const addressValidationRules = () => {
  return [
    check(
      'address.street',
      'Der Straßenname darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen.'
    ).matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
    check(
      'address.houseNumber',
      'Die Hausnummer muss eine Zahl mit maximal 10 Ziffern sein.'
    )
      .isNumeric()
      .isLength({ max: 10 }),
    check(
      'address.zipCode',
      'Es muss eine in Deutschland gültige Postleitzahl sein.'
    ).isPostalCode('DE'),
    check(
      'address.country',
      'Das Land darf nur aus Buchstaben bestehen.'
    ).isAlpha(),
    check(
      'address.geoLocation.longitude',
      'Der Längengrad wird durch eine Dezimalzahl dargestellt.'
    ).isNumeric(),
    check(
      'address.geoLocation.latitude',
      'Der Breitengrad wird durch eine Dezimalzahl dargestellt.'
    ).isNumeric(),
    check(
      'address.geoHash',
      'Der GeoHash besteht aus Buchstaben und Zahlen.'
    ).isAlphanumeric(),
  ];
};

const nameValidationRules = () => {
  return [
    check(
      'name',
      'Der Name darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen.'
    )
      .optional()
      .matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
  ];
};

const cookieValidationRules = () => {
  return [header('cookie').contains('jwt')];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors
    .array({ onlyFirstError: true })
    .map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  addressValidationRules,
  phoneValidationRules,
  idValidationRules,
  nameValidationRules,
  requestValidationRules,
  userValidationRules,
  requireUserIdOrPhoneNumber,
  validate,
  cookieValidationRules,
};
