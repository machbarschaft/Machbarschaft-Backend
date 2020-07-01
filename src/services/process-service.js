'use strict';

import models from '../models/bundle';

export default class ProcessService {
  static async updateProcess(processId, processBody) {
    const process = await models.Process.findById(processId);
    if (!process) {
      return Promise.reject(new Error('No process with given id.'));
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
      return Promise.reject(new Error('No process with given id.'));
    }
    return process;
  }

  static async createProcess() {
    const process = new models.Process();
    return process.save();
  }
}
