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

export const formatDate = (date, onlytime = false) => {
  const addZero = (n) => (n < 10) ? `0${n}` : `${n}`

  const day = addZero(date.getDate())
  const month = addZero(date.getMonth() + 1)
  const hours = addZero(date.getHours())
  const minutes = addZero(date.getMinutes())
  const seconds = addZero(date.getSeconds())

  if (onlytime) return `${hours}:${minutes}:${seconds}`
  return `${day}/${month} ${hours}:${minutes}:${seconds}`
}
