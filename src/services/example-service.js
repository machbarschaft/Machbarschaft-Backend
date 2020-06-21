'use strict';

import models from '../models/bundle';

export default class ExampleService {
  static async createExample(object) {
    const example = new models.Example(object);
    return example.save();
  }

  static async updateExample(object) {
    const example = await models.Example.findOne({ _id: object._id });
    if (!example) {
      return Promise.reject(new Error('Not Found'));
    }
    example.name = object.name;
    example.color = object.color;
    return example.save();
  }

  static async getAllExamples(color) {
    let examples;
    if (color) {
      examples = models.Example.find({ color: color });
    } else {
      examples = models.Example.find();
    }
    return examples;
  }

  static async getExample(id, color) {
    let example;
    if (color) {
      example = models.Example.findOne({
        _id: id,
        color: color,
      });
    } else {
      example = models.Example.findOne({ _id: id });
    }

    if (!example) {
      return Promise.reject(new Error('No example found'));
    }
    return example;
  }
}
