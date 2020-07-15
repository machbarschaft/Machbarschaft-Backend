'use strict';

import {
  AddressType,
  Client,
  GeocodeRequest,
  GeocodingAddressComponentType,
} from '@googlemaps/google-maps-services-js/dist';
import APIError from '../errors';

const client = new Client({});

const translateLocation = async (
  street,
  houseNumber,
  zipCode,
  city,
  country
) => {
  const address =
    street + '-' + houseNumber + '-' + zipCode + '-' + city + '-' + country;
  return client
    .geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_API_KEY,
      },
    })
    .then((result) => {
      if (result.data.status !== 'OK') {
        return Promise.reject(result.data.error_message);
      }
      const address = result.data.results[0];

      const street = address.address_components.find((element) =>
        element.types.includes(AddressType.route)
      );
      const houseNumber = address.address_components.find((element) =>
        element.types.includes(GeocodingAddressComponentType.street_number)
      );
      const zipCode = address.address_components.find((element) =>
        element.types.includes(AddressType.postal_code)
      );
      const city = address.address_components.find((element) =>
        element.types.includes(AddressType.locality)
      );
      const country = address.address_components.find((element) =>
        element.types.includes(AddressType.country)
      );
      const latitude = address.geometry.location.lat;
      const longitude = address.geometry.location.lng;
      if (
        !street ||
        !houseNumber ||
        !zipCode ||
        !city ||
        !country ||
        !latitude ||
        !longitude
      ) {
        return Promise.reject(
          new APIError(
            400,
            'Die Adresse konnte nicht vollständig validiert werden.'
          )
        );
      }
      return Promise.resolve({
        street: street.long_name,
        houseNumber: houseNumber.long_name,
        zipCode: zipCode.long_name,
        city: city.long_name,
        country: country.long_name,
        geoLocation: {
          latitude: latitude,
          longitude: longitude,
        },
      });
    });
};

module.exports = { translateLocation };
