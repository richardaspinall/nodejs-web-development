# Chapter 4

`./EventEmitter/*`

> This demo app uses the EventEmitter class to emit "pulse" events every second with a listener writing to the console

`./HTTPServer/*`

> This demo app shows how the HTTP module can be used to serve webpages and setup specific routing. Additionally we have used `util` and `os` to get information about the server

`./HTTPSniffer/*`

> This module is used in the HTTPServer above to sniff all network trafic when it's running (adding `sniffOn(server)` to our `server.mjs` above)

```js
...
server.listen(new URL(listenOn).port);
sniffOn(server);
console.log(`listening to ${listenOn}`);
...
```
