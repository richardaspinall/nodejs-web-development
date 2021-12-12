# Chapter08: Authenticating Users with a Microservice

## Creating our DB connection file

As per the notes application, we are using a YAML file to store the DB connection config `users/users-sequelize.mjs`. It's a very similar setup as the notes DB config.

1. We load the YAML config file through the environment variable: `SEQUELIZE_CONNECT`. This is for our development environment or if we want to use a configuration file on our production server
2. We check every environment variable to see if it's set in the environment and if it is, we use that instead. This will come in handy later when we use Docker.

This also holds some utility functions used for sanitizing a user object from requests and the DB (minus passwords so we don't accidentally leak them )

---

## REST server with restify

**Packages:**

> https://www.npmjs.com/package/restify

Under `users/user-server.mjs` is our REST server using restify. Restify has a similar set up to express but the main difference is that you need to call `next()` on each handler. `next(false)` indicates that it is the last handler in the function chain, `next(new Error('...')` indicates an error)

---

## Command-line tool for testing and administrating the server

**Packages:**

https://www.npmjs.com/package/commander (commander is a great framework for developing command-line tools)

---

### Set up and configuration

We created a starting point for our CLI in `cli.mjs`. It can take several parameters from the command line as process arguments `process.argv` and configures them into the program, otherwise it will default to `localhost`.

This configuration looks like the below, first defining option `-p` (short), `--port` (long) `<port>` (takes an argument) and then description for the built-in `--help` command. Running `node cli.mjs --help` will display this just like other command line tools we use!

```js
program
  .option('-p, --port <port>', 'Port number for user server, if using localhost')
  .option('-h, --host <host>', 'Port number for user server, if using localhost')
  .option('-u, --url <url>', 'Connection URL for user server, if using a remote server');
```

---

### Adding the first command

We then set up the `add user` and `find-or-create` sub-commands which take options when running (password, first-name etc)

In one window run `npm start` to start the `user-auth-server` and in the other we use the CLI:

`node cli.mjs add richie --password wOrd --family-name Aspinall --given-name Richard --email test@test.com`

Which will add the user!

### Adding the rest of the CRUD commands

We then added the endpoints and commands to find, update and delete users

Find a user:

`node cli.mjs find richie`

List all users:

`node cli.mjs list-users`

Update a user:

`node cli.mjs update richie --password password --family-name Aspinall --given-name Richard --email test@updatedemailaddress.com`

Delete a user:

`node cli.mjs destroy richie`

---

### Password check implementation and command

We need a way to check the password which can be simply done by sending the username and password to our server then doing a few checks. The implementation at this stage is not doing any encryption on the password but we are ensuring that the password does not go beyond the boundry of this server.

We implemented the `/password-check` route for this

Then we created the associated CLI command `password-check`:

`node cli.mjs password-check richie wOrd`

---

## Authentication with the Notes applciation

**Packages:**

https://www.npmjs.com/package/superagent (HTTP request support)

---

We started by installing SuperAgent for our promise based web requests

Next we create a new model `models/users-superagent.mjs` which is essentially an interface to the user server. It makes API REST calls using SuperAgent to the user server and returns the responses to our Notes application. This is our user data model.

**A Tracer Bullet example**

1. From `notes/models/users-superagent.mjs::findOrCreate()` we POST a profile via separate parmeters as JSON to the API endpoint on our user server `users/user-server.mjs::/find-or-create`.
2. From `users/user-server.mjs::/find-or-create` we call `users/users-sequelize.mjs::findOneUser()` passing the username parameter
3. `users/users-sequelize.mjs::findOneUser()` which checks for the user and if there is one, it calls `users/users-sequelize.mjs::sanitizedUser()` to return the user as a user object minus the password completing the trace in the response (inside the `users/user-server.mjs::/find-or-create` endpint). Otherwise it returns undefined and we move to step **4.** below
4. Returning with undefined from step **3.** we are back inside `users/user-server.mjs::/find-or-create` and we call `users/users-sequelize.mjs::createUser()` with the request.
5. From `users/users-sequelize.mjs::createUser()` we call `users/users-sequelize.mjs::userParams()` which simply pulls the parameters off the request and returns a "user object" that can be used to create the user

### Implementing login and logout in notes with passport

**Packages**

https://www.npmjs.com/package/passport (authentication support)

https://www.npmjs.com/package/passport-local (local authentication support – username and passport)

https://www.npmjs.com/package/express-session (look after sessions in an express application)

https://www.npmjs.com/package/session-file-store (allows for storing sessions to disk – only helpful when one server is deployed otherwise we would need a database)

https://www.npmjs.com/package/memorystore (alternative to file store above – which actually doesn't work with this app so we need to use the memory store)

---

We started by installing Passport, Express Session and Session File Store then in `notes/routes/users.mjs` we define our login and logout routes connecting to Passport using the "Passport Local" LocalStrategy (username and password). These routes depending on if the user is logged in / has a session through Passport, sends the user to the appropriate views (home or login)

We also have a logout route that destroys the session and clears cookies

In `notes/app.mjs` we added the session support for express using `session-file-store` and mounted the user router.

In `notes/routes/index.mjs` we added the user from the request to the render function so that the index page will render differently if the user is logged in

In `notes/routes/notes.mjs` we added the `ensureAuthenticated()` middleware to ensure the user is authenticated before allowing them access to the route (passing the user to the template for rendering)

Essentially the above is ensuring / guaranteeing the user is authenticated and passing the user profile to the necassary templates.

---

### Adding login HTML support for templates

In `notes/partials/header.hbs` we added a check for if the user is logged in or not and show different buttons depending on this

We added a new login view: `views/login.hbs`. Then added messages to views `/notedestroy.hbs` and `/noteedit.hbs` for if the user isn't logged in.

---

## Issues

- I ran into a few troubles as I missed the `initPassport(app)` call in `app.mjs` which meant Passport wasn't actually initialized.

- Then `app.use(session..)` needed to come after static calls because it was calling the DB too often.

- A big issue was that `session-file-store` has a major bug and doesn't actually work with passport currently (would only randomly call `passport.deserializeUser()` function – looks like there is a race condition between network and file system )

- Another is we haven't dealt with the case of when a user enters the same key as another (it errors). Keys should probably be automatically generated

---

## Running the app:

We add a new enviornment variable: `USER_SERVICE_URL` which is taken in through the `notes/models/users-superagent.mjs` Model / Interface in the `reqURL()` function. This connects our services together via a hardcoded `authcode` param.

Run `npm start` in the `users` directory to start our users information service

Run `npm start` (which runs: `cross-env DEBUG=notes:* SEQUELIZE_CONNECT=models/sequelize-sqlite.yaml NOTES_MODEL=sequelize USER_SERVICE_URL=http://localhost:5858 node ./app.mjs`) to start our notes application

---

## Twitter login support

### Implementation steps

**Packages**

https://www.npmjs.com/package/dotenv (securely saving environment variables so they don't get added to GitHub etc)

https://www.npmjs.com/package/passport-twitter (for implementing Twitter auth with passport)

---

We started by creating a `.env` file and added: `TWITTER_CONSUMER_KEY` and `TWITTER_CONSUMER_SECRET` (from Twitter API for the associated app)

We then signed up to the Twitter for developers. After adding the appropriate code to`notes/routes/users.mjs` for Passport to use Twitter auth, it didn't initially work.

Added extra logging under `appsupport.mjs::basicErrorHandler()` to show server errors which showed that the Twitter API replied with an error saying we needed to apply for elevated permissions (recent update).

Then there was a `connection closed` error with our `users information server` and after inspecting the DB with the CLI we created, we could see the data was correct but there was a typo in our code

## Keeping things secure

**Packages:**

https://www.npmjs.com/package/bcrypt (used for encrypting and decrypting passwords)

---

### Updating the users service

Installed `bcrypt` into `users` and `notes`.

Added encryption and decryption via `bcrypt` to `users/cli.mjs` and `users/user-server.mjs` implementing the `hashpass()` function which encrypts then the built in compare function to check

```js
async function hashpass(password) {
  let salt = await bcrypt.genSalt(saltRounds);
  let hashed = await bcrypt.hash(password, salt);
  return hashed;
}
```

Verified that the password was encrypted through SQLite shell:

Run: `sqlite3 users-sequelize.sqlite3`

Run: `select * from SQUsers`

Run: `node cli.mjs password-check richie wOrd`

This final command `password-check` verifies the password is correct for the user we entered

### Updating the notes application

The same as above, we need to simply add the `hashpass()` function to `notes/models/users-superagent.mjs` and call it in our interface functions (`await hashpass(password)`) that sends the hashed password over to the `users` microservice

---

# Summary

We did a huge amount in this chapter:

- Creating a new microservice (users)

- Creating a CLI to interact with the microservice

- Interface from our Notes application to the microservice

- Implemented Login support and OAuth support using passport strategies

- Implemented encryption to keep things safe
