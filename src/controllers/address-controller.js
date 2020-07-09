'use strict';

import AddressService from '../services/address-service';

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
      return;
    })
    .catch((error) => {
      if (error.message === 'Unable to validate exact address.') {
        res.status(400).send(error.message);
        return;
      }
      console.log(error);
      res.status(500).send(error);
      return;
    });
  return;
};

module.exports = {
  createAddress,
};
