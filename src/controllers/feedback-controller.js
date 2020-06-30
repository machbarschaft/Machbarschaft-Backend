'use strict';

import FeedbackService from '../services/feedback-service';

const createFeedback = async (req, res) => {
  const type = req.path.split('/')[1];
  const isRequest = type === 'request';
  FeedbackService.addFeedbackToProcess(
    req.user.uid,
    req.params.id,
    isRequest,
    req.body
  )
    .then(() => {
      res.status(201).send('Successfully saved feedback.');
      return;
    })
    .catch((error) => {
      if (error.message === 'Unauthorized') {
        res.status(401).send(error.message);
        return;
      }
      if (error.message.includes('not found')) {
        res.status(404).send(error.message);
        return;
      }
      console.log(error);
      res.send(500).send();
      return;
    });
  return;
};

module.exports = {
  createFeedback,
};
