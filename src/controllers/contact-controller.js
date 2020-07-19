import ContactService from '../services/contact-service';
import APIError from '../errors';

const createContact = (req, res) => {
  ContactService.createContact(req.body.email, req.body.text)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  createContact,
};
