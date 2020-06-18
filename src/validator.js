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
  return oneOf(phoneValidationRules().concat(idValidationRules('userId')));
};

const idValidationRules = (fieldName) => {
  return [
    check(fieldName, 'Die ID muss aus 24 Kleinbuchstaben und Zahlen bestehen.')
      .exists()
      .isLength({ min: 24, max: 24 })
      .isLowercase()
      .isAlphanumeric(),
  ];
};

const phoneValidationRules = () => {
  return [
    check(
      'phone',
      'Die Telefonnummer muss eine gültige deutsche Telefonnummer sein.'
    )
      .exists()
      .isMobilePhone('de-DE'),
  ];
};

const requestValidationRules = () => {
  return [
    body(
      'requestType',
      'Der Auftragstyp darf nur folgende Werte haben: ' +
        requestTypes.toString()
    ).isIn(requestTypes),
    body(
      'urgency',
      'Die Dringlichkeit kann nur folgende Werte haben: ' +
        urgencyCategories.toString()
    ).isIn(urgencyCategories),
    body('extras.carNecessary').isBoolean(),
    body('extras.prescriptionRequired').isBoolean(),
  ]
    .concat(nameValidationRules())
    .concat(addressValidationRules(false));
};

const addressValidationRules = (required) => {
  if (required) {
    return [
      check(
        'address.street',
        'Der Straßenname darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen.'
      )
        .exists()
        .matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
      check(
        'address.houseNumber',
        'Die Hausnummer muss eine Zahl mit maximal 10 Ziffern sein.'
      )
        .exists()
        .isNumeric()
        .isLength({ max: 10 }),
      check(
        'address.zipCode',
        'Es muss eine in Deutschland gültige Postleitzahl sein.'
      )
        .exists()
        .isPostalCode('DE'),
      check('address.country', 'Das Land darf nur aus Buchstaben bestehen.')
        .exists()
        .isAlpha(),
      check(
        'address.geoLocation.longitude',
        'Der Längengrad wird durch eine Dezimalzahl dargestellt.'
      )
        .exists()
        .isNumeric(),
      check(
        'address.geoLocation.latitude',
        'Der Breitengrad wird durch eine Dezimalzahl dargestellt.'
      )
        .exists()
        .isNumeric(),
      check('address.geoHash', 'Der GeoHash besteht aus Buchstaben und Zahlen.')
        .exists()
        .isAlphanumeric(),
    ];
  } else {
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
  }
};

const nameValidationRules = () => {
  return [
    check(
      'name',
      'Der Name darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen.'
    ).matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
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
