import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  //ToDo: landing page logic
  res.send('Hello World!');
});

export default router;
