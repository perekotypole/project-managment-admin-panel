import * as dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import { v1 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'

import initData from '../../initData.js'

export const database = mongoose
  .connect(`mongodb://localhost/${process.env.DATABASE || 'adminpanel'}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

import { User, Content, Session, Role } from '../models/index.js'

export const checkInitData = async () => {
  let adminRole = await Role.findOne({ name: 'admin' })

  await Content.remove({})
  const defaultContent = await Content.insertMany(initData.defaultContent)

  if (adminRole) {
    await Role.updateOne(
      { name: 'admin' }, 
      {
        ...adminRole._doc,
        blocks: defaultContent
          .filter(({ type }) => type === 'block')
          .map(({ _id }) => _id),
        content: defaultContent
          .filter(({ type }) => type === 'page')
          .map(({ _id }) => _id),
      }
    )
  } else {
    adminRole = await Role.create({
      name: 'admin',
      access: defaultContent.map(({ _id }) => _id)
    })
  }

  const admin = await User.findOne({ roleID: adminRole._id })

  if (!admin) {
    await User.create({
      ...initData.admin,
      roleID: adminRole._id
    })
  }
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
  }, process.env.SECRET || 'secret', {
    expiresIn: `${process.env.TOKENTIME || 20}m`,
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