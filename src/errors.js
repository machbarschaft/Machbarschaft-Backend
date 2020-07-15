'use strict';

export default class APIError {
  constructor(status, message) {
    this.message = message;
    this.status = status;
  }

  static handleError(error, res) {
    if (error instanceof APIError) {
      res.status(error.status).send(error.message);
      return;
    }
    console.log(error);
    res.status(500).send('Internal server error.');
    return;
  }
}
