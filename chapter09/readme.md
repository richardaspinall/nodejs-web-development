# Chapter08: Websockets with Socket.IO

**Packages:**

https://www.npmjs.com/package/socket.io (Socket.io for websocket support)

https://www.npmjs.com/package/passport.socketio (for adding support to Passport for websockets )

## Initialization

The most important part of implementing the websockets library is it's structure and how it's initialized in the code:

- Because we had initially hardcoded the secret and store into the session set up (`app.use(session({...}))`), we need to pull those variables out into global variables. This is so we can use them in both the HTTP requests and Websockets

- Next we wrap `Socket.IO` around the server object and integrate passport. This takes in those global variables and adds the cookie parser as middleware

```js

// Wrapping Socket.IO around the server
export const io = socketio(server);

// Integrating Passport and CookieParsing
io.use(
  passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: sessionCookieName,
    secret: sessionSecret,
    store: sessionStore,
  })
);
...

// Addiong session support to express (regular HTTP requests)
app.use(
  session({
    store: sessionStore,
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true,
    name: sessionCookieName,
  })
);
```

## Extending our NotesStore classes for events

Because we had created an `AbstractNotesStore` class that every `NotesStore` extended, we can easily add our event emitter functions to it that the subclasses can call.

`notes/models/Notes.mjs`

```js
...
export class AbstractNotesStore {
  async close() {}
  async update(key, title, body) {}
  async create(key, title, body) {}
  async read(key) {}
  async destroy(key) {}
  async keylist() {}
  async count() {}

  // NEW:
  emitCreated(note) {
    this.emit('notecreated', note);
  }
  emitUpdated(note) {
    this.emit('noteupdated', note);
  }
  emitDestroyed(note) {
    this.emit('notedestroyed', key);
  }
}
```

Then in each subclass, we call these new functions from the approiate crud functions

`notes/models/notes-mongodb.mjs`

```js
  async update(key, title, body) {
    ...
    await collection.updateOne({ notekey: key }, { $set: { title: title, body: body } });
    this.emitUpdated(note);
    return note;
  }

```

## Updating our home page to handle events

`notes/routes/index.mjs`

Whenever an event is emited (created,updated or detroyed), we have a listner that calls the following `emitNoteTitles()` function and then emits to any client connected to the `/home` namespace. There are also "rooms" which differ from the "namespace" in that they are created by the server directly at when the client wants to connect. Namespaces can be connected by the client themself (still can use auth though).

At Slack, a potential structure could have a namespace be all of the public channels combined and a room could be a private channel.

Ref:
https://stackoverflow.com/questions/10930286/socket-io-rooms-or-namespacing

```js
export const emitNoteTitles = async () => {
  const notelist = await getKeyTitlesList();
  debug(`socketio emitNoteTitles ${util.inspect(notes)}`);
  // Only emit this event to clients connected to the home page
  io.of('/home').emit('notetitles', { notelist });
};
```

```js
export function init() {
  // Creating a "/home" namespace so that clients on the home page will only recieve certain events
  io.of('/home').on('connect', (socket) => {
    debug('socketio connection on /home');
  });
  notes.on('notecreated', emitNoteTitles);
  notes.on('noteupdated', emitNoteTitles);
  notes.on('notedestroyed', emitNoteTitles);
}
```
