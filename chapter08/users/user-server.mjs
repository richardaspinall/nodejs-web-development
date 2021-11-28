import restify from 'restify';
import * as util from 'util';
import { SQUser, connectDB, userParams, findOneUser, createUser, sanitizedUser } from './users-sequelize.mjs';

import DBG from 'debug';
const log = DBG('users:service');
const error = DBG('users:error');

/////////////// Set up the REST server

var server = restify.createServer({
  name: 'User-Auth-Service',
  version: '0.0.1',
});

server.use(restify.plugins.authorizationParser());
server.use(check);
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser({ mapParams: true }));

server.listen(process.env.PORT, 'localhost', function () {
  log(server.name + 'listening at ' + server.url);
});

process.on('uncaughtException', function (err) {
  console.error('UNCAUGHT EXCEPTION - ' + (err.stack || err));
  process.exit(1);
});

process.on('unhandledRejection', (reason, p) => {
  console.error(`UNHANDLED PROMISE REJECTION: ${util.inspect(p)} reason: ${reason}`);
  process.exit(1);
});

// Mimic API Key authentication.

var apiKeys = [{ user: 'them', key: 'DBHBVHBV-8474-4764-4736-47536475' }];

function check(req, res, next) {
  if (req.authorization && req.authorization.basic) {
    var found = false;
    for (let auth of apiKeys) {
      if (auth.key === req.authorization.basic.password && auth.user === req.authorization.basic.username) {
        found = true;
        break;
      }
    }
    if (found) next();
    else {
      res.send(401, new Error('Not authenticated'));
      next(false);
    }
  } else {
    req.send(500, new Error('No Authorization Key'));
    next(false);
  }
}
