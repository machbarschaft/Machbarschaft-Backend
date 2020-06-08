import mongoose from 'mongoose';

const coordinatesSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
});

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  houseNumber: {
    type: Number,
    required: true,
  },
  zipCode: {
    type: Number,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  geoLocation: {
    type: coordinatesSchema,
    required: true,
  },
  geoHash: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model('Address', addressSchema);

export default Address;
