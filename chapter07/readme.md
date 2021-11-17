## Chapter06: Data Storage

---

### Changing our logging format

- Through Morgan in `app.mjs`: `app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));`

  - We run our app via `REQUEST_LOG_FORMAT=common npm start`, "common" being a value from Morgan: https://www.npmjs.com/package/morgan#options

### Logging directly to a file.

- There is a solution via Morgan directly, but this holds an open file which is not good for rotation of the file as the server would need to be killed. Instead we can use the `rotating-file-stream` pacakage: https://www.npmjs.com/package/rotating-file-stream

  - With some configuration made to the `app.mjs` (where we add the logging middleware as per above), we can run the command: `REQUEST_LOG_FILE=log.txt REQUEST_LOG_FORMAT=common DEBUG=notes:* node ./app.mjs` which outputs to a `log.txt` file

### Debugging our messages

- Express uses the "debug" npm package by default: https://www.npmjs.com/package/debug but it can also be useful in our code

-
