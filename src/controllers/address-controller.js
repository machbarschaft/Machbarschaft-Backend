import AddressService from '../services/address-service';
import APIError from '../errors';

const createAddress = (req, res) => {
  AddressService.createAddress(
    req.body.street,
    req.body.houseNumber,
    req.body.zipCode,
    req.body.city,
    req.body.country
  )
    .then((address) => {
      return AddressService.prepareAddressResponse(address);
    })
    .then((addressResponse) => {
      res.status(200).json(addressResponse);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  createAddress,
};
