import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  //ToDo: landing page logic
  res.send('Hello World!');
});

export default router;
