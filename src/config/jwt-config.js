const AuthenticationType = Object.freeze({
  none: 0,
  login: 1,
  logout: 2,
  heartbeat: 3,
});

// defined jwt secret to sign jwt tokens
const jwtSecret = () => {
  return process.env.JWT_SECRET;
};

const jwtOptions = (authenticationType = AuthenticationType.none) => {
  return {
    expiresIn: authenticationType === AuthenticationType.login ? '30d' : 0,
    issuer: process.env.URL,
  };
};

const jwtCookie = (authenticationType = AuthenticationType.none) => {
  return {
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: process.env.CORS_ENV === 'development' ? false : true,
    expires:
      authenticationType === AuthenticationType.login
        ? new Date(new Date().setDate(new Date().getDate() + 30))
        : new Date(),
  };
};

module.exports = {
  AuthenticationType,
  jwtOptions,
  jwtCookie,
  jwtSecret,
};
