import * as dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { v1 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'

import initData from '../../initData.js'
const defContent = [
  ...initData?.contentPage.map(page => ({
    title: page.title,
    slug: page.slug,
    link: `/${page.slug}`,
    type: 'page',
  })),
  ...initData?.contentBlocks.map(block => ({
    title: block.title,
    slug: block.slug,
    type: 'block',
  }))
]

const secret = process.env.SECRET || 'secret'
const tokenTime = process.env.TOKENTIME || 20

export const database = (url) => mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

import { User, Content, Session, Role } from '../models/index.js'

export const checkInitData = async () => {
  await Content.deleteMany({})
  const content = await Content.insertMany(defContent)

  const contentForRole = {
    content: content.filter(el => el.type === 'page').map(el => el._id),
    blocks: content.filter(el => el.type === 'block').map(el => el._id),
  }

  let role = await Role.findOne({ baseRole: true })
  if (!role) role = await Role.create({ name: 'admin', baseRole: true, ...contentForRole })
  else await role.updateOne(contentForRole)

  const admin = await User.findOne({ baseUser: true })
  if (!admin) await User.create({
    baseUser: true,
    ...initData.admin,
    rolesID: [role._id]
  })
  else await User.findOneAndUpdate({
    baseUser: true,
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