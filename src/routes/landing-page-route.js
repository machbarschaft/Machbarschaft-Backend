import Router from 'express';
import models from '../models/bundle';

const router = Router();

router.get('/', async (req, res) => {
  //ToDo: landing page logic
  res.send('Hello World!');
});

export default router;
