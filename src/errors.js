'use strict';

export default class APIError {
  constructor(status, message) {
    this.message = message;
    this.status = status;
  }

  static handleError(error, res) {
    if (error instanceof APIError) {
      res.status(error.status).json({ errors: [{ Fehler: error.message }] });
      return;
    }
    console.log(error);
    res
      .status(500)
      .json({
        errors: [{ Fehler: 'Es ist ein interner Fehler aufgetreten.' }],
      });
    return;
  }
}
