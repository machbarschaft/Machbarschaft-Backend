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

In the folder twilio, two .json-files can be found. They represent two different "Flows" in Twilio. One of them is handling the call redirect to the help seeker when a helper calls by recognizing the caller. The second one is a Flow to automatically handle incoming requests for help seekers and send it to our backend.

To use these files, you need a Twilio account, a created project and two phone numbers that can be used. 

You need to create two Flows first. Follow the [documentation](https://www.twilio.com/docs/studio/user-guide#creating-flows) to create these.

In a second step, the .json-files have to be imported to the Studio Flows. The documentation for this can be found [here](https://www.twilio.com/docs/studio/user-guide#importing-and-exporting-flows). After the successful import, the URLs of the HTTP requests have to be modified: post_call_status for call redirection and send_request_api for the request creation Flow.

To connect a Flow to a phone number, follow the [official Twilio documentation](https://www.twilio.com/docs/studio/user-guide#configuring-your-twilio-number-for-studio).

The Twilio SID and Twilio Auth token which we need later can be found in the Console Dashboard.

**Configure Sendgrid**

You need any email address. With SendGrid, you have to verify ownership of the email address by confirming an email or by connecting your domain to it. After successful verification, emails can be sent with SendGrid which improves the delivery rate. To get the Sendgrid API key, follow the [documentation](https://sendgrid.com/docs/ui/account-and-settings/api-keys/).

**Set the environment variables**

Create a .env file with the following entries:

```
# port to be used for the backend application. Default is 3000.
PORT=

# URL of the Frontend application to use the link in swagger, JWT and in emails, for example for resetPassword or emailVerification. If you use a localhost server, include the port (for example localhost:3000). Has to be a full URL including https:// or http://.
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
