Best practices:
- set 'use strict'; in the first line of your js file
- use arrow function expression (example () => {})
- start curly braces ({}) in same line
- use const and let, do not use var
- use === instead of == operator
- use Map instead of Object

- extract business logic as service class
- validate request body (joi) and parameters ()

naming convention:
- file names: kebab-case, no capital letters
- class names: UpperCamelCase
- constants, variables, functions: lowerCamelCase

Development and review guidelines:
- create 1 feature branch per ticket from master
- set jira ticket to 'in review':
	- open pull request
	- if unable to merge, merge master into feature branch and solve conflicts
	- request reviewer
	- rework according to comments until approved (can take several review rounds)
- after reviewing a ticket, either approve and merge into master or write comments and set jira ticket to 'in development'
