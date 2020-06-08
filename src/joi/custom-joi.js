'use strict';

import joi from '@hapi/joi';
import phone from 'joi-phone-number';

const CustomJoi = joi.extend(phone);

export default CustomJoi;
