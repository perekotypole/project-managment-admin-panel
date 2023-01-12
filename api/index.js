import auth from './auth.js'
import access from './access.js'
import projects from './projects.js'
import roles from './roles.js'
import checker from './checker.js'

import { verifyUser } from './middleware/index.js'

export default (app) => {
  app.use('/api/auth', auth)
  app.use('/api/access', verifyUser, access)
  app.use('/api/projects', verifyUser, projects)
  app.use('/api/roles', verifyUser, roles)
  app.use('/api/checker', checker)
}