import models from '../models/bundle';
import GoogleService from '../external-parties/google-service';

export default class AddressService {
  static async createAddress(street, houseNumber, zipCode, city, country) {
    const address = await this.findAddress(
      street,
      houseNumber,
      zipCode,
      city,
      country
    );
    if (address) {
      return address;
    }
    return GoogleService.translateLocation(
      street,
      houseNumber,
      zipCode,
      city,
      country
    ).then(async (newAddress) => {
      let existingAddress = await this.findAddress(
        newAddress.street,
        newAddress.houseNumber,
        newAddress.zipCode,
        newAddress.city,
        newAddress.country
      );
      if (existingAddress) {
        return existingAddress;
      }
      existingAddress = new models.Address(newAddress);
      return existingAddress.save();
    });
  }

  static prepareAddressResponse(address) {
    return Promise.resolve({
      _id: address._id,
      street: address.street,
      houseNumber: address.houseNumber,
      zipCode: address.zipCode,
      city: address.city,
      country: address.country,
    });
  }

  static async findAddress(street, houseNumber, zipCode, city, country) {
    return models.Address.findOne({
      street: street,
      houseNumber: houseNumber,
      zipCode: zipCode,
      city: city,
      country: country,
    });
  }
}
