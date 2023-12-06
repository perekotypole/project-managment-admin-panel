import * as dotenv from 'dotenv';

import express from 'express';
import next from 'next';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import bodyParser from 'body-parser';

import api from './api/index.js';
import { checkInitData, database } from './api/helpers/index.js';
import { verifyUser, pageAccess } from './api/middleware/index.js';
import { initTimers } from './api/checker.js';

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 7070;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const secret = process.env.SECRET || 'secret';
const DBUrl = `${process.env.DB_URI || 'mongodb://0.0.0.0:27017/'}${process.env.DATABASE || 'adminpanel'}?authSource=admin`;

console.log(DBUrl);

database(DBUrl)
  .then(async () => {
    console.info('Database is connected');
    await checkInitData();
    await initTimers();
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });

app.prepare()
  .then(() => {
    const server = express();

    server.use(session({
      secret,
      resave: false,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: DBUrl,
      }),
    }));

    server.use(cors());
    server.set('trust proxy', true);

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    api(server);

    server.get('/_next/*', (req, res) => handle(req, res));
    server.get('*', verifyUser, pageAccess, (req, res) => handle(req, res));

    server.listen(port, (err) => {
      if (err) throw err;
      console.info(`Ready on http://${hostname}:${port}`);
    });
  })
  .catch((ex) => {
    console.error(ex.stack);
    process.exit(1);
  });
