import * as dotenv from 'dotenv'
dotenv.config()

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
]

export const existPaths = [
  '/',
  '/login',
  ...contentPage.map(({slug}) => `/${slug}`)
]

export const admin = {
  username: 'admin',
  login: process.env.ADMIN_LOGIN || 'admin',
  password: process.env.INIT_PASS || 'password',
}

export default {
  contentBlocks,
  contentPage,
  existPaths,
  admin,
}