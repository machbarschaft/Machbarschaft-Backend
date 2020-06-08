Best practices:
- configure your IDE to execute prettier on every save action
- set the --save-exact flag when adding an external package with npm
- use import rather than require()
- set 'use strict'; in the first line of your js file
- use arrow function expression (example () => {})
- start curly braces ({}) in same line
- use const and let, do not use var
- use === instead of == operator
- use Map instead of Object
- use 'return', even if it is the last line to be executed

- extract business logic as service class
- validate request body and parameters with express-validator
- write swagger documentation for every endpoint (ref. https://dev.to/akshendra/generating-documentation-on-the-fly-in-express-2652)

naming convention:
- file names: kebab-case, no capital letters
- class names: UpperCamelCase
- constants, variables, functions: lowerCamelCase

Development and review guidelines:
- create 1 feature branch per ticket from master
- set jira ticket to 'in review':
	- open pull request
	- if unable to merge, merge master into feature branch and solve conflicts
	- request at least two reviewers
	- rework according to comments until approved (can take several review rounds)
- after reviewing a ticket, either approve and merge into master or write comments and set jira ticket to 'in development'
