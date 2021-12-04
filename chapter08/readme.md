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

### Implementation steps

<br>

#### Set up and configuration

We created a starting point for our CLI in `cli.mjs`. It can take several parameters from the command line as process arguments `process.argv` and configures them into the program, otherwise it will default to `localhost`.

This configuration looks like the below, first defining option `-p` (short), `--port` (long) `<port>` (takes an argument) and then description for the built-in `--help` command. Running `node cli.mjs --help` will display this just like other command line tools we use!

```js
program
  .option('-p, --port <port>', 'Port number for user server, if using localhost')
  .option('-h, --host <host>', 'Port number for user server, if using localhost')
  .option('-u, --url <url>', 'Connection URL for user server, if using a remote server');
```

#### Adding the first command

We then set up the `add user` and `find-or-create` sub-commands which take options when running (password, first-name etc)

In one window run `npm start` to start the `user-auth-server` and in the other we use the CLI:

`node cli.mjs add richie --password wOrd --family-name Aspinall --given-name Richard --email test@test.com`

Which will add the user!

#### Add the rest of the commands

We then added the endpoints and commands to find, update and delete users

Find a user: `node cli.mjs find richie`

List all users: `node cli.mjs list-users`

Update a user: `node cli.mjs update richie--password w0rd --family-name Aspinall --given-name Richard --email test@updatedemailaddress.com`

Delete a user: `node cli.mjs destroy richie`

---
