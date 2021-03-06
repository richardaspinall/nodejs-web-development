# Node.js-Web-Development-Fifth-Edition (Book)

Pick up from Packt publishing: https://www.packtpub.com/product/node-js-web-development-fifth-edition/9781838987572

> Code repo: https://github.com/robogeek/Node.js-Web-Development-Fifth-Edition

This book takes us through installing and setting up Node, how it works, and developing an Express Application.

We learn about how to create microservice architectures, authentication, data storage and retrieval, socket.io, deploying through Docker and Terraform on AWS. All the while using the latest features of Node (2020). Additionally practices around Unit and Functional Testing, Security

---

## Chapter04: The event loop and intro to express applications

We start learning about how Node.js works and specifically the event loop / the way to code Node.js applications.

---

## Chapter05: Building an Express Application – Notes app

We build a bare bones notes application from scratch using MVC, CRUD and handlebars as the chosen template engine. We briefly look at scaling the application and how our in memory store will not work well!

## Chapter06: Mobile first!

Not much NodeJS goes on in this chapter. We instead simply look at modifying the UI for mobile-first using Bootstrap.

## Chapter07: Data Storage

Some great concepts are covered in this chapter:

    - Abstractions of data model implementations by subclassing
    - Implementing data persistence using several database engines
    - Logging debugging information
    - Catching important errors
    - Using `import()` to enable runtime selection of databases to use
    - Designing simple configuration files with YAML

## Chapter08 Authenticating Users with a Microservice

- Creating a new microservice (users)

- Creating a CLI to interact with the microservice

- Interface from our Notes application to the microservice

- Implemented Login support and OAuth support using passport strategies

- Implemented encryption to keep things safe

## Chapter09 Websockets with Socket.IO

- Implemented `Socket.io` so that users can see real time updates on notes

- Added support for Passport on the websockets

- Added a new data model: messages and added support with Socket.io there too

- Manipulation of HTML with `jQuery`

- Used the `EventEmitter` class to send events across our server code.
