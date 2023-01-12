import { Router } from 'express'
import { Session, User, } from './models/index.js'
import { generateToken } from './helpers/index.js'
import { verifyUser } from './middleware/index.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { token } = req.body
  
    if (!token) return res.json({ 
      error: 'Token is required'
    })
  
    const userExists = await User.findOne({ token })
    if (!userExists) return res.json({ 
      error: 'The token is not registered'
    })
  
    const additionalData = {
      ip: req.ip,
      useragent: req.headers['user-agent'],
      requestedWith: req.headers['x-requested-with'],
      acceptLanguage: req.headers['accept-language'],
    }
  
    // req.session.tokens = null
    req.session.tokens = await generateToken(req.sessionID, userExists._id, additionalData)
    // process.exit()
    return res.json({ 
      success: true,
    })

  } catch (error) {
    console.error('/auth/login => ', error)
    return res.json({ error })
  }
})

router.post('/logout', verifyUser, async (req, res) => {
  try {
    req.session.destroy()

    return res.json({ 
      success: true,
    })

  } catch (error) {
    console.error('/auth/logout => ', error)
    return res.json({ error })
  }
})

router.post('/remoteAuth', verifyUser, async (req, res) => {
  try {
    const projectToken = req.projectToken
    const additionalData = {
      ip: req.ip,
      useragent: req.headers['user-agent'],
      requestedWith: req.headers['x-requested-with'],
      acceptLanguage: req.headers['accept-language'],
    }
    
    const authData = await Session.findOne({ additionalData })
    if (!authData) return res.json({ access: false })
  
    const user = await User.findById(authData.userID)
    const { access } = user
  
    return res.json({ access: access.includes(projectToken) })

  } catch (error) {
    console.error('/auth/remoteAuth => ', error)
    return res.json({ error })
  }
})

export default router