'use strict';

import mongoose from 'mongoose';

const colors = ['red', 'blue', 'green'];

const exampleSchema = new mongoose.Schema({
  name: String,
  color: {
    type: String,
    enum: colors,
    required: true,
  },
});

const Example = mongoose.model('Example', exampleSchema);

export { Example, colors };
