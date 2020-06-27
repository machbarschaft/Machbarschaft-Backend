import { requestTypes, urgencyCategories } from './models/request-model';
import { colors } from './models/example-model';

const {
  check,
  body,
  validationResult,
  header,
  oneOf,
  param,
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
      "Die '" + fieldName + "' muss aus 24 Kleinbuchstaben und Zahlen bestehen."
    ).isMongoId(),
  ];
};

const phoneValidationRules = () => {
  return [
    check(
      'phone',
      'Die Telefonnummer muss eine gültige deutsche Mobiltelefonnummer sein.'
    ).isMobilePhone('de-DE'),
  ];
};

const processFeedbackValidationRules = () => {
  return [
    param(
      'type',
      'Der Typ muss einen der folgenden Werte haben: request, response'
    ).isIn(['request', 'response']),
    body(
      'needContact',
      'Gib an ob eine Rückmeldung vom Machbarschaft-Team erwünscht ist (true, false)'
    ).isBoolean(),
    body('comment', 'Die Nachricht des Feedbacks als Zeichenkette.').isString(),
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
    body(
      'addressId',
      'Die ID der Adresse ist eine 24-stellige Zeichenkette aus Kleinbuchstaben und Zahlen.'
    )
      .optional()
      .isMongoId(),
  ].concat(nameValidationRules('name'));
};

const addressValidationRules = () => {
  return [
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
  ]
    .concat(nameValidationRules('street'))
    .concat(nameValidationRules('country'));
};

const nameValidationRules = (fieldName) => {
  return [
    check(
      fieldName,
      "Das Feld '" +
        fieldName +
        "' darf aus maximal drei Wörtern bestehen, je bis zu 60 Zeichen."
    )
      .optional()
      .matches(/^([a-zA-Z\-\.\xC0-\uFFFF]{1,60}[ ]{0,1}){1,3}$/),
  ];
};

const cookieValidationRules = () => {
  return [header('cookie').contains('jwt')];
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
  processFeedbackValidationRules,
  requestValidationRules,
  userValidationRules,
  requireUserIdOrPhoneNumber,
  validate,
  cookieValidationRules,
  exampleValidationRules,
};
