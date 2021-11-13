# Chapter 4: The event loop and intro to express applications

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

`./fibonacci/*`

> This is an example express application to demonstrate blocking of Node's single threaded architecture.

### Part 1: "Unblocking the event loop"

- We started by creating an inefficient algorithm to calculate fibonacci numbers which can be demonstrated by changing the `fibonacciRouter` route in `app.js` to the non-async version. This will process each number one at a time blocking anyone else from making a call to the server.

- We then created `fibonacci-async1.js` which still uses the same inefficient algorithm but is handling each request asynchronously (not blocking the event loop), so requests can continue to be made by other people to the server.

- Further demonstration can be seen through `fibotimes.js`; which simply loops through the numbers and calls `math.js`

### Part 2: "Creating a rest server"

- `fiboserver.js` is a separate server that has a single endpoint which returns the fibonacci number for a given number

  1. Start the server: `SERVERPORT=3002 node ./fiboserver.js`
  2. Via curl: `curl -f http://localhost:3002/fibonacci/25`

- `fiboclient.js` programmatically calls the Fibonacci service

  - Start the client `npm run client`

> This client calls the Fibonacci service with descending number (starting at 30-1). The results demonstrate that Node is not blocking any of the requests and the order of the results show that calculations return in ascending times (1-30)

- Finally adding `routes/fibonacci-rest.js` as the new route which calls our `./fiboserver.js` offloading the work to this server.

  1. Start the rest server `npm run startrest`
  2. Start the fibonacci server `npm run server`
  3. Head to `http://localhost:3000/fibonacci?fibonum=10`

> This shows us that we can offload the CPU load for these calculations to a separate server. Which preserves the CPU capacity for the frontend server.
