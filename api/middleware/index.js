import jwt from 'jsonwebtoken'
import { refresh } from '../helpers/index.js'
import { User, Content, Role } from '../models/index.js'

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

  const secret = process.env.SECRET || 'secret'
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
  if (req.originalUrl == '/'
    || req.originalUrl === '/login'
    || req.originalUrl === '/favicon.ico') return next()

  const { userID = null } = req.user
  if (!userID) {
    req.session.destroy()

    res.redirect('/login')
    return
  }

  const user = await User.findById(userID)
  const role = await Role.findById(user.roleID)
  const access = await Content.find({ _id: { $in: role?.content || [] }})

  const slug = req.originalUrl.split('/')[1]
  if (!access.map(({ slug }) => slug).includes(slug)) {
    res.redirect('/')
    return
  }

  req.accessIDs = user.access
  req.access = access

  return next()
}

export const dataAccess = async (req, res, next) => {
  const { userID } = req.user
  const user = await User.findById(userID)
  const role = await Role.findById(user.roleID)
  const access = await Content.find({ _id: { $in: [...role?.content, ...role?.blocks] }})

  req.accessIDs = [...role?.content, ...role?.blocks]
  req.access = access

  return next()
}