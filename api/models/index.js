import mongoose from 'mongoose'

export const User = mongoose.model('User', {
  username: { type: String },
  description: { type: String },
  login: { type: String, unique: true },
  password: { type: String },
  rolesID: [{ type: mongoose.Types.ObjectId }],
  startedProject: { type: mongoose.Types.ObjectId },
  accessStatus: { type: String },
  baseUser: { type: Boolean },
  createdAt: { type: Date, default: () => new Date() },
});

export const Role = mongoose.model('Role', {
  name: { type: String },
  color: { type: String },
  description: { type: String },
  blocks: { type: [mongoose.Types.ObjectId] },
  content: { type: [mongoose.Types.ObjectId] },
  access: { type: [mongoose.Types.ObjectId] },
  baseRole: { type: Boolean },
  createdAt: { type: Date, default: () => new Date() },
});

export const Content = mongoose.model('Content', {
  title: { type: String },
  slug: { type: String },
  link: { type: String },
  type: { type: String, enum: ['page', 'block'] },
  content: { type: Object },
  createdAt: { type: Date, default: () => new Date() },
});

export const Session = mongoose.model('Session', {
  _id: { type: String },
  expires: { type: Date },
  session: { type: String },
  userID: { type: mongoose.Types.ObjectId },
  refreshToken: { type: String },
  additionalData: { type: Object },
  createdAt: { type: Date, default: () => new Date() },
});

export const Project = mongoose.model('Project', {
  name: { type: String },
  description: { type: String },
  type: { type: String, enum: ['website', 'telegramBot']},
  link: { type: String },
  status: { type: Boolean, default: () => false },
  
  token: { type: String, unique: true },
  requestLink: { type: String },
  reloadTime: { type: Number },
  checkDate: { type: Date },
  telegram: {
    token: { type: String },
    chat: { type: String }
  },

  createdAt: { type: Date, default: () => new Date() },
});

export const Error = mongoose.model('Error', {
  projectID: { type: Object },
  message: { type: String },
  createdAt: { type: Date, default: () => new Date() },
});