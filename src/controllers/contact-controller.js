import ContactService from '../services/contact-service';
import APIError from '../errors';

const createContact = (req, res) => {
  ContactService.createContact(req.body.email, req.body.text)
    .then((contact) => {
      res.status(200).json(contact._id);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  createContact,
};
