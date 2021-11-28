# Chapter08: Authenticating Users with a Microservice

## Creating our DB connection file

As per the notes application, we are using a YAML file to store the DB connection config `users/users-sequelize.mjs`. It's a very similar setup as the notes DB config.

1. We load the YAML config file through the environment variable: `SEQUELIZE_CONNECT`. This is for our development environment or if we want to use a configuration file on our production server
2. We check every environment variable to see if it's set in the environment and if it is, we use that instead. This will come in handy later when we use Docker.

This also holds some utility functions used for sanitizing a user object from requests and the DB (minus passwords so we don't accidentally leak them )

## REST server with restify

**Packages:**

> https://www.npmjs.com/package/restify

Under `users/user-server.mjs` is our REST server using restify. Restify has a similar set up to express but the main difference is that you need to call `next()` on each handler. `next(false)` indicates that it is the last handler in the function chain, `next(new Error('...')` indicates an error)

## Command-line tool for testing and administrating the server

**Packages:**

https://www.npmjs.com/package/commander (commander is a great framework for developing command-line tools)
