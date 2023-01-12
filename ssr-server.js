import * as dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import next from 'next'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'

import api from './api/index.js'
import { checkInitData, database } from './api/helpers/index.js'
import { verifyUser, pageAccess } from './api/middleware/index.js'
import bodyParser from 'body-parser'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 7070
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

database
  .then(async () => {
    console.log('Database is connected')
    await checkInitData()
  })
  .catch((ex) => {
    console.error(ex.stack)
    process.exit(1)
  })

app.prepare()
.then(() => {
  const server = express()
  
  server.use(session({
    secret: process.env.SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: `mongodb://localhost/${process.env.DATABASE || 'adminpanel'}`
    })
  }))

  server.use(cors())
  server.set('trust proxy', true)

  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))

  api(server)

  server.get('/_next/*', (req, res) => handle(req, res))
  server.get('*', verifyUser, pageAccess, (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
.catch((ex) => {
  console.error(ex.stack)
  process.exit(1)
})
