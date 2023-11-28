import * as dotenv from 'dotenv'
dotenv.config()

import { Router } from 'express'
import { MongoClient } from 'mongodb';
import { dataAccess } from './middleware/index.js'

import ip from "ip"

const router = Router()
const accessSlug = 'mongodb'

const DBUrl = process.env.DB_URI ? `${process.env.DB_URI}?authSource=admin` : 'mongodb://0.0.0.0:27017/'
const DBName = 'admin';

router.post('/', dataAccess, async (req, res) => {
  const access = req.content.map(({slug}) => slug).includes(accessSlug)
  if (!access) {
    res.redirect('/')
    return
  }

  const client = new MongoClient(DBUrl);

  try {
    await client.connect();
    const db = client.db(DBName);

    const { users } = await db.command({ usersInfo: 1 });

    res.json({
      success: true,
      users: users.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0
        if (!a.createdAt) return 1
        if (!b.createdAt) return -1
        
        return b.createdAt - a.createdAt;
      }),
      host: ip.address(),
      port: client.options.hosts[0].toString()?.split(':')?.[1],
    })
  } catch (error) {
    console.error('/mongodb => ', error)
    return res.json({ error })
  } finally {
    await client.close();
  }
})

router.post('/createUser', dataAccess, async (req, res) => {
  const access = req.content.map(({slug}) => slug).includes(accessSlug)
  if (!access) {
    res.redirect('/')
    return
  }

  const userData = req.body
  const client = new MongoClient(DBUrl);

  try {
    await client.connect();
    const db = client.db(DBName);

    const adminDb = db.admin();

    await adminDb.command({
      createUser: userData.user,
      pwd: userData.password,
      roles: userData.roles,
    });

    await db.collection('system.users').findOneAndUpdate(
      { _id: `${DBName}.${userData.user}` },
      { $set: {
        title: userData.title,
        description: userData.description,
        password: userData.password,
        createdAt: new Date(),
      }}
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('/mongodb/createUser => ', error)
    return res.json({ error })
  } finally {
    await client.close();
  }
})

router.post('/removeUser', dataAccess, async (req, res) => {
  const access = req.content.map(({slug}) => slug).includes(accessSlug)
  if (!access) {
    res.redirect('/')
    return
  }
  
  const userData = req.body
  const client = new MongoClient(DBUrl);

  try {
    await client.connect();
    const db = client.db(DBName);

    const adminDb = db.admin();

    await adminDb.command({
      dropUser: userData.user,
    });

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('/mongodb/removeUser => ', error)
    return res.json({ error })
  } finally {
    await client.close();
  }
})

router.post('/updateUser', dataAccess, async (req, res) => {
  const access = req.content.map(({slug}) => slug).includes(accessSlug)
  if (!access) {
    res.redirect('/')
    return
  }

  const userData = req.body
  const client = new MongoClient(DBUrl);

  try {
    await client.connect();
    const db = client.db(DBName);

    const adminDb = db.admin();

    await adminDb.command({
      updateUser: userData.user,
      pwd: userData.password,
      roles: userData.roles,
    });

    await db.collection('system.users').findOneAndUpdate(
      { _id: `${DBName}.${userData.user}` },
      { $set: { title: userData.title, description: userData.description, password: userData.password, }}
    )

    res.json({
      success: true,
    })
  } catch (error) {
    console.error('/mongodb/updateUser => ', error)
    return res.json({ error })
  } finally {
    await client.close();
  }
})

router.post('/databases', dataAccess, async (req, res) => {
  const access = req.content.map(({slug}) => slug).includes(accessSlug)
  if (!access) {
    res.redirect('/')
    return
  }

  const client = new MongoClient(DBUrl);

  try {
    await client.connect();
    const db = client.db(DBName);

    const adminDb = db.admin();
    const { databases } = await adminDb.listDatabases();

    res.json({
      success: true,
      databases: databases.map(database => database.name),
    })
  } catch (error) {
    console.error('/mongodb/databases => ', error)
    return res.json({ error })
  } finally {
    await client.close();
  }
})

export default router