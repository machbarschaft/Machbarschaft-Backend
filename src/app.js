'use strict';

import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import routes from './routes';

const app = express();

//all application-wide middlewares
app.use(helmet()); //enforcing some security best practices, e.g. https connection, prevent clickjacking ..
app.use(cors()); //Cross-Origin Resource Sharing, restrict access between web applications

//all routes
app.use('/', routes.landingPage);

module.exports = app;
