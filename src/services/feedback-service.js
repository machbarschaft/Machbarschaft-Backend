'use strict';

import models from '../models/bundle';

export default class FeedbackService {
  static async addFeedbackToProcess(
    userId,
    requestOrResponseId,
    isRequest,
    reqBody
  ) {
    let owner, processId;
    if (isRequest === true) {
      const request = await models.Request.findOne({
        _id: requestOrResponseId,
      });
      if (!request) {
        return Promise.reject(new Error('Request not found'));
      }
      owner = request.user;
      processId = request.process;
    } else {
      const response = await models.Response.findOne({
        _id: requestOrResponseId,
      });
      if (!response) {
        return Promise.reject(new Error('Response not found'));
      }
      owner = response.user;
      processId = response.process;
    }
    if (userId !== owner.toString()) {
      return Promise.reject(new Error('Unauthorized'));
    }

    const feedback = models.FormFeedback({
      process: processId,
      user: userId,
      needContact: reqBody.needContact,
      comment: reqBody.comment,
    });
    const process = await models.Process.findOne({ _id: processId });
    process.feedback.push(feedback._id);
    process.save();
    return feedback.save();
  }
}
