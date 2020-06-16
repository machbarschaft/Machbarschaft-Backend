'use strict';

import ExampleService from '../services/example-service';

const create = async (req, res) => {
  ExampleService.createExample(req.body)
    .then((example) => {
      res.status(200).json(example);
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
    });
};

const update = async (req, res) => {
  ExampleService.updateExample(req.body)
    .then((example) => {
      res.status(200).json(example);
      return;
    })
    .catch((error) => {
      if (error.message === 'Not Found') {
        res.status(404).send();
        return;
      }
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const getAll = async (req, res) => {
  ExampleService.getAllExamples(req.query.color)
    .then((examples) => {
      res.status(200).json(examples);
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const getOne = async (req, res) => {
  ExampleService.getExample(req.params.id, req.query.color)
    .then((example) => {
      res.status(200).json(example);
      return;
    })
    .catch((error) => {
      res.status(500).send();
      console.log(error);
      return;
    });
  return;
};

const dummy = async (req, res) => {
  res.status(200).send('Hello my authenticated friend.');
  return;
};

module.exports = {
  getOne,
  getAll,
  create,
  update,
  dummy,
};
