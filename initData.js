import * as dotenv from 'dotenv'
dotenv.config()

import md5 from 'md5'

export const contentBlocks = [
  {
    title: 'Resources monitoring',
    slug: 'resources',
  },
]

export const contentPage = [
  {
    title: 'Users',
    slug: 'users',
  },
  {
    title: 'Roles',
    slug: 'roles',
  },
  {
    title: 'Projects',
    slug: 'projects',
  },
  {
    title: 'Errors manager',
    slug: 'errors',
  },
  {
    title: 'MongoDB',
    slug: 'mongodb',
  },
]

export const existPaths = [
  '/',
  '/login',
  ...contentPage.map(({slug}) => `/${slug}`)
]

export const admin = {
  username: 'admin',
  login: process.env.ADMIN_LOGIN || 'admin',
  password: md5(process.env.INIT_PASS || 'password'),
}

export default {
  contentBlocks,
  contentPage,
  existPaths,
  admin,
}