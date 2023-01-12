import * as dotenv from 'dotenv'
dotenv.config()

export const defaultContent = [
  {
    title: 'Resources monitoring',
    slug: 'resources',
    type: 'block'
  },
  // {
  //   title: 'Users',
  //   slug: 'users',
  //   link: '/users',
  //   type: 'page'
  // },
  {
    title: 'Roles',
    slug: 'roles',
    link: '/roles',
    type: 'page'
  },
  {
    title: 'Projects',
    slug: 'projects',
    link: '/projects',
    type: 'page'
  },
  {
    title: 'Errors manager',
    slug: 'errors',
    link: '/errors',
    type: 'page'
  },
]

export const admin = {
  username: 'admin',
  token: process.env.INIT_TOKEN || 'token',
}

export default {
  defaultContent,
  admin,
}