import * as dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { v1 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'

import initData from '../../initData.js'
const defContent = [
  ...initData?.contentPage,
  ...initData?.contentBlocks
]

const initLogin = process.env.ADMIN_LOGIN || 'admin'
const secret = process.env.SECRET || 'secret'
const tokenTime = process.env.TOKENTIME || 20

export const database = (url) => mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

import { User, Content, Session, Role } from '../models/index.js'

export const checkInitData = async () => {
  let content = await Content.find({
    slug: { $in: defContent.map(el => el.slug) },
  })

  if (content.length !== defContent.length) {
    await Content.deleteMany({})
    content = await Content.insertMany([...initData?.contentPage.map(page => ({
      title: page.title,
      slug: page.slug,
      link: `/${page.slug}`,
      type: 'page',
    })), ...initData?.contentBlocks.map(block => ({
      title: block.title,
      slug: block.slug,
      type: 'block',
    }))])
  }

  const contentForRole = {
    content: content.filter(el => el.type === 'page').map(el => el._id),
    blocks: content.filter(el => el.type === 'blocks').map(el => el._id),
  }

  let role = await Role.findOne({ name: 'admin' })
  if (!role) role = await Role.create({ name: 'admin', ...contentForRole })
  else await Role.findByIdAndUpdate(role._id, contentForRole)

  const admin = await User.findOne({ login: initLogin })
  if (!admin) await User.create({
    ...initData.admin,
    rolesID: [role._id]
  })
  else User.findOneAndUpdate({
    login: initLogin,
    rolesID: { $ne: role._id }
  }, { $push: { rolesID: role._id } })
}

export const generateToken = async (sessionID, userID, additionalData) => {
  const refreshToken = uuid()

  const sessionExist = await Session.findOne({ _id: sessionID, session: { $exists: true } })

  if (sessionExist) {
    await Session.findByIdAndUpdate(sessionID, {
      userID,
      refreshToken,
      additionalData,
    })
  } else {
    await Session.findByIdAndDelete(sessionID)
    return
  }

  const accessToken = await jwt.sign({
    userID,
  }, secret, {
    expiresIn: `${tokenTime}m`,
  })

  return {
    access: accessToken,
    refresh: refreshToken,
  }
}

export const refresh = async (refreshToken) => {
  const authData = await Session.findOne({ refreshToken })
  if (!authData) return

  const { userID, additionalData } = authData
  return await generateToken(authData._id, userID, additionalData)
}