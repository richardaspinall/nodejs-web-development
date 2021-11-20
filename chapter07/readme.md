# Chapter06: Data Storage

## Changing our logging format

Through Morgan in `app.mjs`: `app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));`

We run our app via `REQUEST_LOG_FORMAT=common npm start`, "common" being a value from Morgan: https://www.npmjs.com/package/morgan#options

## Logging directly to a file.

---

There is a solution via Morgan directly, but this holds an open file which is not good for rotation of the file as the server would need to be killed. Instead we can use the `rotating-file-stream` pacakage: https://www.npmjs.com/package/rotating-file-stream

With some configuration made to the `app.mjs` (where we add the logging middleware as per above), we can run the command: `REQUEST_LOG_FILE=log.txt REQUEST_LOG_FORMAT=common DEBUG=notes:* node ./app.mjs` which outputs to a `log.txt` file

## Debugging messages

---

Express uses the "debug" npm package by default: https://www.npmjs.com/package/debug but it can also be useful in our code

At the top of `appsupport.mjs` we import the `debug` module and create our two debug functions. `debug` is our regular debug logs and `dbgerror` is for error traces

```js
// appsupport.mjs
import { default as DBG } from 'debug';
const debug = DBG('notes:debug');
const dbgerror = DBG('notes:error');
```

We then add the functions (like we would manually with `console.log()`) to where we would like them to be switched on:

```js
// app.js
server.on('request', (req, res) => {
  debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});
```

```js
// appsupport.mjs
export function onError(error) {
  dbgerror(error);
  if (error.syscall !== 'listen') {
    throw error;
  }
  ...
```

We can run the app with debugging switched on via: `DEBUG=notes:* node ./app.mjs`

## Filesystem data store

---

**Directory:**

> `models/notes-fs.mjs`

**Run:**

> `npm run fs-start`

**Implementation steps:**

We implemented storage in a filesystem by creating a new model extending the current `AbstractNotesStore` (`models/Notes.mjs)

Two additional functions needed to be created: `JSON()` which returns a note as JSON for storing, and `fromJSON(json)` which ensures the JSON is a note, then creates an instance of `Note()` (essentially a TypeScript type guard)

`models/notes-fs.mjs` contains the implementation of the FS store, particular care was made to ensure the directory where the JSON files were being stored was there. Otherwise it was simply reading and writing to the directory.

The main takeaway from this was the refactoring to enable runtime switching between the stores (defaulting to memory if one is not found). This is done with the factory function in `models/notes-store.mjs` and implemented in `app.mjs`:

```js
import { useModel as useNotesModel } from './models/notes-store.mjs';
useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : 'memory')
  .then((store) => {})
  .catch((error) => {
    onError({ code: 'ENOTESSTORE', error });
  });
```

**Notes:**

- We run the file storage implementation of the server with:

  `cross-env DEBUG=notes:* PORT=3000 NOTES_MODEL=fs node ./app.mjs`

  where `NOTES_MODEL=fs` (each model is named `notes-XXX.mjs` where XXX is replaced by the name of the store implementation)

## LevelDB data store

**Directory:**

> `models/notes-level.mjs`

**Run:**

> `npm run level-start`

**Implementation steps:**

Same as the file system store: we implement a new store extending `AbstractNotesStore`, and we are using LevelDB (https://www.npmjs.com/package/level) for this implementation.

In addition to the function implementations, LevelDB (and future DBs) requires us to close the DB connection. From `./appsupport.mjs` (`catchProcessDeath()`) we added code to catch when the process is failes and dies (expectedly or unexpectedly) through Unix process signals.

**Notes:**

- Simultaneous access to a database is not supported so we can't have two instances of our server running and accessing this DB (it locks the files)

## SQLite3 data store

> `models/notes-sqlite3.mjs`

**Run:**

> `npm run sqlite3-start`

**Implementation steps:**

We started by installing the `sqlite3` package (https://www.npmjs.com/package/sqlite3), then created a schema in `models/schema-sqlite3.sql` with a script to initialize our database (`npm run sqlite3-setup`)

**Notes:**

- SQLite is already installed on MacOS (command `sqlite3` will open the program in your shell)

- `control D` to exit `sqlite3`
