import * as dotenv from 'dotenv';

import mongoose from 'mongoose';
import { v1 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';

import {
  contentBlocks,
  contentPage,
  admin,
} from '../../initData.js';

import {
  User, Content, Session, Role,
} from '../models/index.js';

dotenv.config();

const defContent = [
  ...contentPage.map((page) => ({
    title: page.title,
    slug: page.slug,
    link: `/${page.slug}`,
    type: 'page',
  })),
  ...contentBlocks.map((block) => ({
    title: block.title,
    slug: block.slug,
    type: 'block',
  })),
];

const secret = process.env.SECRET || 'secret';
const tokenTime = process.env.TOKENTIME || 20;

export const database = (url) => mongoose.connect(url);

export const checkInitData = async () => {
  await Content.deleteMany({});
  const content = await Content.insertMany(defContent);

  const contentForRole = {
    content: content.filter((el) => el.type === 'page').map((el) => el.id),
    blocks: content.filter((el) => el.type === 'block').map((el) => el.id),
  };

  let role = await Role.findOne({ baseRole: true });
  if (!role) role = await Role.create({ name: 'admin', baseRole: true, ...contentForRole });
  else await role.updateOne(contentForRole);

  const adminUser = await User.findOne({ baseUser: true });
  if (!adminUser) {
    await User.create({
      baseUser: true,
      ...admin,
      rolesID: [role.id],
    });
  } else {
    await User.findOneAndUpdate({
      baseUser: true,
      rolesID: { $ne: role.id },
    }, { $push: { rolesID: role.id } });
  }
};

export const generateToken = async (sessionID, userID, additionalData) => {
  const refreshToken = uuid();

  const sessionExist = await Session.findOne({ _id: sessionID, session: { $exists: true } });

  if (sessionExist) {
    await Session.findByIdAndUpdate(sessionID, {
      userID,
      refreshToken,
      additionalData,
    });
  } else {
    await Session.findByIdAndDelete(sessionID);
    return {};
  }

  const accessToken = await jwt.sign({
    userID,
  }, secret, {
    expiresIn: `${tokenTime}m`,
  });

  return {
    access: accessToken,
    refresh: refreshToken,
  };
};

export const refresh = async (refreshToken) => {
  const authData = await Session.findOne({ refreshToken });
  if (!authData) return {};

  const { userID, additionalData } = authData;
  const tokens = await generateToken(authData.id, userID, additionalData);
  return tokens;
};

export const mainPageRedirect = async (user, currentParams) => {
  if (user.accessStatus) return { status: user.accessStatus };

  if (currentParams.project) {
    const project = await Role.findOne({
      _id: { $in: user.rolesID },
      access: currentParams.project,
    });
    if (project) return { project: currentParams.project };
  }

  if (user.startedProject) return { project: user.startedProject.toString() };

  // const blocks = await Role.find({ _id: { $in: user.rolesID }}).distinct('blocks')
  // if (blocks.length) return { blocks: blocks.map(el => el.toString()).toString() }

  return {};
};

export const paramsIsEqual = (accessParams, requestParams) => {
  const equal = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const areParamsEqual = Object.entries(accessParams)
    .every(([key, value]) => equal(value, requestParams[key]));

  if (!areParamsEqual) {
    return false;
  }

  return true;
};
