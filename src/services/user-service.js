'use strict';

import models from '../models/bundle';

export default class UserService {
  createUser = async (phone) => {
    models.User.create();
  };
}
