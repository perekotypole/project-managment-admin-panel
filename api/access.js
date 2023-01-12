import { Router } from 'express'
import { Content } from './models/index.js'
import { dataAccess } from './middleware/index.js'

const router = Router()

router.post('/getPages', dataAccess, async (req, res) => {
  const accessContent = req.accessIDs || []

  try {
    const pages = await Content.find({ _id: { $in: accessContent }, type: 'page'})
  
    return res.json({ 
      success: true,
      pages
    })

  } catch (error) {
    console.error('/access/getPages => ', error)
    return res.json({ error })
  }
})

router.post('/getBlocks', dataAccess, async (req, res) => {
  const accessContent = req.accessIDs || []

  try {
    const blocks = await Content.find({ _id: { $in: accessContent }, type: 'block'})
  
    return res.json({ 
      success: true,
      blocks
    })

  } catch (error) {
    console.error('/access/getBlocks => ', error)
    return res.json({ error })
  }
})

export default router