'use strict';

import cors from 'cors';
import helmet from 'helmet';
import express from 'express';
import routes from './routes/route-index';

const app = express();

//all application-wide middlewares
app.use(cors()); //Cross-Origin Resource Sharing, restrict access between web applications
app.use(helmet()); //enforcing some security best practices, e.g. https connection, prevent clickjacking ..

//all routes
app.use('/', routes.landingPage);
app.use('/user', routes.user);
app.use('/request', routes.request);

module.exports = app;
