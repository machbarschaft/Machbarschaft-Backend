'use strict';

// Configuration variables
const jwt = {
  secret: process.env.JWT_SECRET,
  options: {
    audience: 'localhost',
    expiresIn: '30d',
    issuer: 'localhost',
  },
  cookie: {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: false,
    expires: new Date(new Date().setDate(new Date().getDate() + 30)),
  },
};

module.exports = {
  jwt,
};
