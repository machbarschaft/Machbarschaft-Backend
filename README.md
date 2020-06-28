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

' Start the database server

**Set the environment variables**

Create a .env file with the following entries (the JWT secret is for test purposes and may be subject to changes):

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/machbarschaft
JWT_SECRET=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAru//ki6E7T3jACIHGqwaV+gm5/ezGFUCqI7k/6Vdh7HvhOCGdL8hyEIUmOcwhYBgmkAFunuZSAq6wq8xk6QjwkHNya9nd+Nfv2/ynfqNgUNBOiYCoIVTTAYmee46tlvXBYrNYHDcPLe1PJTqL4ytgD+WmwE1oHkIZ6qDflHsh0/KnV/+0HZm6qLtW2uPaKqOfF/YitcSNBzlxrDSYBPEH4+FyWx+CGnyxldLhfiV986O6bnAHhOjX81/ASDyE4wsKRgziKR4gRReINblAeRjCwTVT2pCL623+JhrC1Of38U6aJ92zqKJxw5744YcZsSgiVse8O8wccjRsv+nRyMnZQIDAQAB
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_AUTH_SERVICE_SID=
```

## Start the project

**Production environment**

```
npm start
```
**API Documentation**

The documentation can be found on /docs.
