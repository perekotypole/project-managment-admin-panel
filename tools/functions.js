export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const res = Array(length).fill(null).map(_ => chars[Math.floor(Math.random() * chars.length)]).join('')
  return res
}

export const setAutoErrorRemoval = (
  key = 'autoRemoval',
  millesec = 60 * 60 * 1000
  // millesec = 20 * 1000
) => localStorage.setItem(key, new Date().getTime() + millesec)

export const getAutoErrorRemoval = (key = 'autoRemoval') => {
  const item = localStorage.getItem(key)
  if (!item) return null

  if (new Date().getTime() > item) {
    localStorage.removeItem(key)
    return null
  }
  return item
}
