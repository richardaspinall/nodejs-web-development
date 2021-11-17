# Chapter 6: Mobile first!

- Installing from NPM: Bootstrap, JQuery and Popper

- Loading resources into `views/layout.hbs`

- Adjusting the app to redirect the `/assets/vendor` third party libraries (Bootstrap..) to the right location under `node_modules`:

```js
app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
```

- Customized each view to be mobile friendly utilizing bootstrap

- Customized a Bootstrap build (Skipped)

  - From `/themes/package.json` we automated the build (doesn't appear to work for Silicon chips at this stage)

- Using third-party custom Boostrap themes

  - Download and install the "Minty" theme: `npm run dl-minty`
  - Made the appropriate changes to `app.mjs` for loading bootstrap
