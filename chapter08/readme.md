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

#### Adding the rest of the CRUD commands

We then added the endpoints and commands to find, update and delete users

Find a user:

`node cli.mjs find richie`

List all users:

`node cli.mjs list-users`

Update a user:

`node cli.mjs update richie--password w0rd --family-name Aspinall --given-name Richard --email test@updatedemailaddress.com`

Delete a user:

`node cli.mjs destroy richie`

#### Password check implementation and command

We need a way to check the password which can be simply done by sending the username and password to our server then doing a few checks. The implementation at this stage is not doing any encryption on the password but we are ensuring that the password does not go beyond the boundry of this server.

We implemented the `/password-check` route for this

Then we created the associated CLI command `password-check`:

`node cli.mjs password-check richie wOrd`

---

## Authentication with the Notes applciation

### Implementation steps

**Packages:**
https://www.npmjs.com/package/superagent (HTTP request support)

We started by installing SuperAgent for our promise based web requests

Next we create a new model `models/users-superagent.mjs` which is essentially an interface to the user server. It makes API REST calls using SuperAgent to the user server and returns the responses to our Notes application. This is our user data model.

**A Tracer Bullet example**

1. From `notes/models/users-superagent.mjs::findOrCreate()` we POST a profile via separate parmeters as JSON to the API endpoint on our user server `users/user-server.mjs::/find-or-create`.
2. From `users/user-server.mjs::/find-or-create` we call `users/users-sequelize.mjs::findOneUser()` passing the username parameter
3. `users/users-sequelize.mjs::findOneUser()` which checks for the user and if there is one, it calls `users/users-sequelize.mjs::sanitizedUser()` to return the user as a user object minus the password completing the trace in the response (inside the `users/user-server.mjs::/find-or-create` endpint). Otherwise it returns undefined and we move to step **4.** below
4. Returning with undefined from step **3.** we are back inside `users/user-server.mjs::/find-or-create` and we call `users/users-sequelize.mjs::createUser()` with the request.
5. From `users/users-sequelize.mjs::createUser()` we call `users/users-sequelize.mjs::userParams()` which simply pulls the parameters off the request and returns a "user object" that can be used to create the user

#### Implementing login and logout in notes with passport

**Packages**

https://www.npmjs.com/package/passport (authentication support)

https://www.npmjs.com/package/passport-local (local authentication support – username and passport)

https://www.npmjs.com/package/express-session (look after sessions in an express application)

https://www.npmjs.com/package/session-file-store (allows for storing sessions to disk – only helpful when one server is deployed otherwise we would need a database)

Started by installed Passport, Express Session and Session File Store

Then in `notes/routes/users.mjs` we define our login and logout routes connecting to Passport using the "Passport Local" LocalStrategy (username and password). These routes depending on if the user is logged in / has a session through Passport, sends the user to the appropriate views (home or login)

We also have a logout route that destroys the session and clears cookies

In `notes/app.mjs` we added the session support for express using `session-file-store
