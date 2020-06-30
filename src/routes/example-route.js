'use strict';

import Router from 'express';
import ExampleController from './../controllers/example-controller';
import Validator from './../validator';

const router = Router();

/**
 * @swagger
 * /example
 *  get:
 *      summary: Get all examples
 *      description: Returns a list of all examples.
 *      tags:
 *          - example
 *      parameters:
 *          - in: query
 *            name: color
 *            description: The color all examples must have
 *            type: string
 *            required: false
 *            enum:
 *              - red
 *              - blue
 *              - green
 *      responses:
 *          200:
 *              description: List of examples
 *              schema:
 *                  type: object
 *                  properties:
 *                      examples:
 *                          type: array
 *                          description: all examples
 *                          items:
 *                              type: string
 *          500:
 *              description: Internal server error
 */
router.get(
  '/color',
  // validator missing
  ExampleController.getAll
);

/**
 * @swagger
 * /example/{id}
 *  get:
 *      summary: Get all examples
 *      description: Returns a list of all examples.
 *      tags:
 *          - example
 *      parameters:
 *          - in: query
 *            name: color
 *            description: The color all examples must have.
 *            type: string
 *            required: false
 *            enum:
 *              - red
 *              - blue
 *              - green
 *          - in: path
 *            name: id
 *            description: The id of the requested example object.
 *            type: string
 *            required: true
 *      responses:
 *          200:
 *              description: The example object with the given id.
 *              schema:
 *                  type: object
 *                  properties:
 *                      example:
 *                          type: example
 *                          description: The example object.
 *          500:
 *              description: Internal server error
 */
router.get(
  '/:id',
  // validator missing
  ExampleController.getOne
);

/**
 * swagger comment is missing
 */
router.post(
  '/',
  Validator.exampleValidationRules(),
  Validator.validate,
  ExampleController.create
);

/**
 * @swagger
 * /example
 *  put:
 *      summary: Update an example object
 *      description: Overwrite the attributes of the example object identified by the given _id.
 *      tags:
 *          - example
 *      requestBody:
 *          required: true
 *          content:
 *              application/x-www-form-urlencoded:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          _id:
 *                              type: string
 *                          name:
 *                              type: string
 *                          color:
 *                              type: color enum
 *                  example:
 *                      _id: sjf84jg8f9bbfdfghu53k4j5
 *                      name: John
 *                      color: green
 *       responses:
 *          200:
 *              description: The updated example object.
 *              schema:
 *                  type: object
 *                  properties:
 *                      example:
 *                          type: example
 *                          description: The example object.
 *          404:
 *              description: The example with the given _id was not found.
 *          500:
 *              description: Internal server error
 */
router.put(
  '/',
  Validator.idValidationRules('_id'),
  Validator.exampleValidationRules(),
  Validator.validate,
  ExampleController.update
);

/**
 * swagger comment is missing
 */
router.get(
  '/cookie-required',
  Validator.cookieValidationRules(),
  Validator.validate,
  ExampleController.dummy
);

export default router;
