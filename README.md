# Machbarschaft-Backend
NodeJS Backend for Machbarschaft

## Prerequisites

Both for the back end and front end application check

* nodejs [official website](https://nodejs.org/en/) - nodejs includes [npm](https://www.npmjs.com/) (node package manager)

Our NodeJS version number: 12.17.0 // npm: 6.14.4

Just for the backend application:

* mongodb [official installation guide](https://docs.mongodb.org/manual/administration/install-community/)

## Setup (before first run)

**Install node dependencies**

```
npm install
```

**Set up your database**

Start the database server

**Configure Twilio**

See Twilio documentation in folder twilio. 

**Configure Sendgrid**

You need any email address. With SendGrid, you have to verify ownership of the email address by confirming an email or by connecting your domain to it. After successful verification, emails can be sent with SendGrid which improves the delivery rate.

**Set the environment variables**

Create a .env file with the following entries:

```
# port to be used for the backend application. Default is 3000.
PORT=

# URL of the Frontend application to use the link in emails, for example for resetPassword or emailVerification.
URL=

# MongoDB connection. Format for remote instance for example mongodb+srv://dbUser:dbPasswort@dbUrl/dbName?retryWrites=true&w=majority, for local instances usually mongodb://localhost:27017/dbName
MONGODB_URI=

# Secret for JWT to sign the tokens for authentication. This can be for example a password or a public key.
JWT_SECRET=

# Account SID to use Twilio service
TWILIO_ACCOUNT_SID=

# Auth token to use Twilio service
TWILIO_AUTH_TOKEN=

# API Key to send emails using Sendgrid
SENDGRID_API_KEY=

# Email address configured in Sendgrid to send emails from
FROM_EMAIL=

# Own Twilio secret to make twilio endpoints only accessible for Twilio. Can be any password.
TWILIO_SECRET=

# Choose nodejs environment
CORS_ENV=production|development
```

## Start the project

**Production environment**

```
npm start
```
**API Documentation**

The documentation can be found on root /.
