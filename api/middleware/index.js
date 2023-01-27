import * as dotenv from 'dotenv'
dotenv.config()

import jwt from 'jsonwebtoken'
import querystring from 'querystring'
import { existPaths } from '../../initData.js'
import { mainPageRedirect, paramsIsEqual, refresh } from '../helpers/index.js'
import { User, Content, Role, Project } from '../models/index.js'

const secret = process.env.SECRET || 'secret'

export const verifyUser = async (req, res, next) => {
  // return next()
  const { tokens } = req.session

  if (!tokens?.access || !tokens?.refresh) {
    if (req.originalUrl === '/login') return next()
    res.redirect('/login')
    return
  }

  if (req.originalUrl === '/login') {
    res.redirect('/')
    return
  }

  const accessToken = tokens.access
  const refreshToken = tokens.refresh

  try {
    req.user = await jwt.verify(accessToken, secret)
  } catch (e) {
    const newTokens = await refresh(refreshToken)
    req.session.tokens = newTokens

    if (!newTokens) {
      res.redirect('/login')
      return
    }
    
    req.user = await jwt.verify(newTokens.access, secret)
  }

  const { userID } = req.user
  const userExists = await User.findById(userID)

  if (!userExists) {
    req.session.destroy()

    res.redirect('/login')
    return
  }

  return next()
}

export const pageAccess = async (req, res, next) => {
  const originalUrl = req.originalUrl.match(/\/?(\w)*/)[0]

  if (originalUrl === '/login'
    || !existPaths.includes(originalUrl)) return next()

  const { userID = null } = req.user
  const user = await User.findById(userID)

  if (!user) {
    req.session.destroy()

    res.redirect('/login')
    return
  }

  if (originalUrl === '/') {
    const params = await mainPageRedirect(user, req.query)
    if (paramsIsEqual(params, req.query)) return next()

    res.redirect(`/?${querystring.stringify(params)}`)
    return
  }

  const contentIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('content')
  const access = await Content.find({ _id: { $in: contentIDs || [] }})

  if (!access.map(({ link = '' }) => link).includes(originalUrl)) {
    res.redirect('/')
    return
  }

  // req.accessIDs = contentIDs
  // req.access = access

  return next()
}

export const dataAccess = async (req, res, next) => {
  const { userID } = req.user

  const user = await User.findById(userID)

  req.contentIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('content')
  req.blocksIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('blocks')
  req.projectsIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('access')

  req.content = await Content.find({ _id: { $in: req.contentIDs || [] }}).select('slug')
  req.blocks = await Content.find({ _id: { $in: req.blocksIDs || [] }}).select('slug')
  req.projects = await Project.find({ _id: { $in: req.projectsIDs || [] }}).select('name type link token')
  
  return next()
}