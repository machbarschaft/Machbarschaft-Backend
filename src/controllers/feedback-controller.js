import FeedbackService from '../services/feedback-service';
import APIError from '../errors';

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
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

const isFeedbackSubmitted = async (req, res) => {
  FeedbackService.existsFeedbackForProcess(req.user.uid, req.query.processId)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) => {
      APIError.handleError(error, res);
    });
};

module.exports = {
  createFeedback,
  isFeedbackSubmitted,
};
