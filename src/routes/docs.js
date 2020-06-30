import Router from 'express';
import definition from '../swagger_config';
import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';

const router = Router();

const options = {
  definition,
  apis: [
    path.resolve(__dirname, 'auth-route.js'),
    path.resolve(__dirname, 'phone-route.js'),
    path.resolve(__dirname, 'request-route.js'),
    path.resolve(__dirname, 'process-route.js'),
    path.resolve(__dirname, 'feedback-route.js'),
  ],
};

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../docs.html'));
});

router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerJSDoc(options));
});

export default router;
