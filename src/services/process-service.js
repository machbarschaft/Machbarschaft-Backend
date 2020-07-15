'use strict';

import models from '../models/bundle';
import APIError from '../errors';

export default class ProcessService {
  static async updateProcess(processId, processBody) {
    const process = await models.Process.findById(processId);
    if (!process) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Prozess mit der angegebenen ID.')
      );
    }
    if (processBody.finishedAt) {
      process.finishedAt = processBody.finishedAt;
    }

    if (processBody.requests) {
      process.requests.push(processBody.requests);
    }
    if (processBody.feedback) {
      process.feedback.push(processBody.feedback);
    }
    if (processBody.response) {
      process.response.push(processBody.response);
    }
    return process.save();
  }

  static async getProcess(processId) {
    const process = await models.Process.findById(processId);
    if (!process) {
      return Promise.reject(
        new APIError(404, 'Es gibt keinen Prozess mit der angegebenen ID.')
      );
    }
    return process;
  }

  static async createProcess() {
    const process = new models.Process();
    return process.save();
  }
}
