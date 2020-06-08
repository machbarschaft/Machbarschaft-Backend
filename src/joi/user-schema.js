'use strict';

import CustomJoi from './custom-joi';

const createSchema = CustomJoi.object().keys({
  phone: CustomJoi.string()
    .phoneNumber({ defaultCountry: 'GE', format: 'international' })
    .required(),
});

export { createSchema };
