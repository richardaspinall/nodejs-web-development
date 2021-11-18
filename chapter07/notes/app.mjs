import { default as express } from 'express';
import { default as hbs } from 'hbs';
import * as path from 'path';
// import * from favicon from 'serve-favicon'
import { default as logger } from 'morgan';
import { default as rfs } from 'rotating-file-stream';
import { default as DBG } from 'debug';
const debug = DBG('notes:debug');
const dbgerror = DBG('notes:error');

import { default as cookieParser } from 'cookie-parser';
import * as http from 'http';
import { approotdir } from './approotdir.mjs';
const __dirname = approotdir;
import { normalizePort, onError, onListening, handle404, basicErrorHandler } from './appsupport.mjs';

import { router as indexRouter } from './routes/index.mjs';
import exp from 'constants';
import { router as notesRouter } from './routes/notes.mjs';

import { useModel as useNotesModel } from './models/notes-store.mjs';
useNotesModel(process.env.NOTES_MODEL ? process.env.NOTES_MODEL : 'memory')
  .then((store) => {})
  .catch((error) => {
    onError({ code: 'ENOTESSTORE', error });
  });

export const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname, 'partials'));

//uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// Logging through Morgan
app.use(
  logger(process.env.REQUEST_LOG_FORMAT || 'dev', {
    stream: process.env.REQUEST_LOG_FILE
      ? rfs.createStream(process.env.REQUEST_LOG_FILE, {
          size: '10M', // rotate every 10 MegaBytes writeen
          interval: '1d', // rotate daily
          compress: 'gzip', // compress rotated files
        })
      : process.stout,
  })
);

// Don't need this anymore because we can turn on our own DEBUG flag
// if (process.env.REQUEST_LOG_FILE) {
//   app.use(logger(process.env.REQUEST_LOG_FORMAT || 'dev'));
// }

// Express config for request bodys
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Cookie parsing
app.use(cookieParser());

// Sending the `/public/` folder's goodies (static files like CSS and JS) to our users
app.use(express.static(path.join(__dirname, 'public')));

// Loading Bootstrap... from correct `node_modules` path
// app.use('/assets/vendor/bootstrap', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist')));
app.use('/assets/vendor/bootstrap/js', express.static(path.join(__dirname, 'node_modules', 'bootstrap', 'dist', 'js')));
app.use('/assets/vendor/bootstrap/css', express.static(path.join(__dirname, 'minty')));
app.use('/assets/vendor/jquery', express.static(path.join(__dirname, 'node_modules', 'jquery', 'dist')));
app.use('/assets/vendor/popper.js', express.static(path.join(__dirname, 'node_modules', 'popper.js', 'dist', 'umd')));
app.use('/assets/vendor/feather-icons', express.static(path.join(__dirname, 'node_modules', 'feather-icons', 'dist')));

// Router function lists
app.use('/', indexRouter);
app.use('/notes', notesRouter);

// error handlers
// catch 404 and forward to error handler
app.use(handle404);
app.use(basicErrorHandler);

export const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

export const server = http.createServer(app);
server.listen(port);

server.on('request', (req, res) => {
  debug(`${new Date().toISOString()} request ${req.method} ${req.url}`);
});

server.on('error', onError);
server.on('listening', onListening);
