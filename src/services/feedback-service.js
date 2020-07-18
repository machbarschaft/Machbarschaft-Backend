'use strict';

import models from '../models/bundle';
import APIError from '../errors';

export default class FeedbackService {
  static async addFeedbackToProcess(
    userId,
    requestOrResponseId,
    isRequest,
    reqBody
  ) {
    let owner, processId, requestOrResponse;
    if (isRequest === true) {
      const request = await models.Request.findOne({
        _id: requestOrResponseId,
      });
      if (!request) {
        return Promise.reject(
          new APIError(404, 'Es wurde kein Auftrag gefunden.')
        );
      }
      requestOrResponse = request;
      owner = request.user;
      processId = request.process;
    } else {
      const response = await models.Response.findOne({
        _id: requestOrResponseId,
      });
      if (!response) {
        return Promise.reject(
          new APIError(404, 'Es wurde keine Auftragannahme gefunden.')
        );
      }
      requestOrResponse = response;
      owner = response.user;
      processId = response.process;
    }
    if (userId !== owner.toString()) {
      return Promise.reject(new APIError(401, 'Unauthorized'));
    }

    const feedback = models.FormFeedback({
      process: processId,
      user: userId,
      needContact: reqBody.needContact,
      comment: reqBody.comment,
    });
    const process = await models.Process.findOne({ _id: processId });
    process.feedback.push(feedback._id);
    return feedback
      .save()
      .then(() => {
        return process.save();
      })
      .then(() => {
        if (isRequest) {
          requestOrResponse.status = 'done';
          requestOrResponse.log.set('done', Date.now());
        }
        requestOrResponse.feedbackSubmitted = true;
        return requestOrResponse.save();
      });
  }

  static async existsFeedbackForProcess(userId, processId) {
    const feedback = await models.ProcessFeedback.findOne({
      user: userId,
      process: processId,
    });
    if (feedback) {
      return true;
    }
    return false;
  }
}
