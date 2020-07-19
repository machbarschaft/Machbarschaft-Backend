# Dependencies

### general: 
* nodemon - live rebuild of the project after saving changes
* Express.js - REST API framework
* Mongoose - ORM (Object Related Mapping) for nosql database MongoDB, interface to communicate with database, validates structure of documents specified by mongoose schemas
* express-validator - validate request body and parameter input
* body-parser - parse request body to json
* dotenv - make variables specified in .env file accessible as process.env.XY
* babel - lets us use the latest javascript features
* twilio - twilio connection
* @sendgrid/mail - sendgrid mail send functions
* @googlemaps/google-maps-services-js - Google Maps API
* swagger-jsdoc - documentation for endpoints

### authentication:
* JWT
* bcrypt
* passport
* passport-jwt
* passport-jwt-cookiecombo
* passport-local-mongoose

### code consistency:
* prettier - enforce consistent code style
* eslint - enforce consistent code style
* eslint-config-airbnb-base - established style guide
* eslint-config-prettier - make eslint and prettier work together
* eslint-plugin-import - make eslint and prettier work together
* eslint-plugin-prettier -make eslint and prettier work together

### security:
* helmet - enforcing some security best practices, e.g. https connection, prevent clickjacking ..
* hpp (not integrated yet)
* csurf (not integrated yet)
* cors - Cross-Origin Resource Sharing, restrict access between web applications
* express-rate-limit (not integrated yet)
