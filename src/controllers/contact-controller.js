'use strict';

import ContactService from '../services/contact-service';
import APIError from '../errors';

const createContact = (req, res) => {
  ContactService.createContact(req.body.email, req.body.text)
    .then((contact) => {
      res.status(200).json(contact._id);
      return;
    })
    .catch((error) => {
      APIError.handleError(error, res);
      return;
    });
  return;
};

module.exports = {
  createContact,
};
