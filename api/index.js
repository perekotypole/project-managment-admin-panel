import { Router } from 'express';
import auth from './auth';
import access from './access';
import projects from './projects';
import roles from './roles';
import users from './users';
import checker from './checker';
import resources from './resources';
import mongodb from './mongodb';

import { verifyUser } from './middleware/index';
import { sendMessage } from './helpers/telegram';

process.on('uncaughtException', (err) => {
  console.error('Critical error:');
  console.error(err);

  sendMessage({
    token: null,
    chatID: null,
    message: `Uncaught exception: ${err}`,
  });
});
const router = Router();

export default (app) => {
  app.use('/api', router.get('/', (_, res) => res.json({ alive: true })));

  app.use('/api/auth', auth);
  app.use('/api/checker', checker);

  app.use('/api/access', verifyUser, access);
  app.use('/api/projects', verifyUser, projects);
  app.use('/api/roles', verifyUser, roles);
  app.use('/api/users', verifyUser, users);
  app.use('/api/resources', verifyUser, resources);
  app.use('/api/mongodb', verifyUser, mongodb);
};
