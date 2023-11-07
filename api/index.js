import auth from './auth.js'
import access from './access.js'
import projects from './projects.js'
import roles from './roles.js'
import users from './users.js'
import checker from './checker.js'
import resources from './resources.js'
import mongodb from './mongodb.js'

import { verifyUser } from './middleware/index.js'
import { sendMessage } from './helpers/telegram.js'

process.on('uncaughtException', err => {
  sendMessage({
    token: null,
    chatID: null,
    message: `Uncaught exception: ${err}` ,
  })
})

import { Router } from 'express'
const router = Router()

export default (app) => {
  app.use('/api', router.get('/', (_, res) => res.json({ alive: true })))

  app.use('/api/auth', auth)
  app.use('/api/checker', checker)
  
  app.use('/api/access', verifyUser, access)
  app.use('/api/projects', verifyUser, projects)
  app.use('/api/roles', verifyUser, roles)
  app.use('/api/users', verifyUser, users)
  app.use('/api/resources', verifyUser, resources)
  app.use('/api/mongodb', verifyUser, mongodb)
}