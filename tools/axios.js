import axios from 'axios'

const baseUrl = new URL(global.window.origin)

export default axios.create({
  baseURL: `${baseUrl.origin}/api`,
})