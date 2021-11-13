# Chapter 5: Building an Express Application – Notes app

`./notes/*`

> This is where the action is. Our MVC basic app for note taking. Along with viewing, we have implemented adding, editing and deleting notes

`./notes/app.mjs`, `approotdir.mjs`, `appsupport.mjs`

> These files make up our server and have helper functions pulled out of the "express generated" code which we have modularized.

## M

`./notes/models/*`

> Two models: `Note` and `AbstractNotesStore` which we have implemented as an `InMemoryNotesStore` for holding our notes. (obviously it is refreshed on server restart)

## V

`./notes/views/*`

> Our views are built by the Handlebars template engine (https://handlebarsjs.com/)

`./notes/partials/header.hbs`

> This just currently has our navigation header which is shown on every page as a partial via `./notes/views/layout.hbs`

## C

`./notes/routes/*`

> The controllers are found in the routes directory. `index.mjs` is the home route and `notes.mjs` has our CRUD API controllers.

## Server scaling: _Throw more servers at it_

`./notes/package.json`

> Our `package.json` references serveral server instances to start. They all have separate `InMemoryNotesStore` instances so while it might scale , they don't share their data! This is a good start though as it gets us thinking!
