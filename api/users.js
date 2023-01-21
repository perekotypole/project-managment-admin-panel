import { Router } from 'express'
import { Content, Project, Role, User } from './models/index.js'
import { dataAccess } from './middleware/index.js'

const router = Router()
const accessSlug = 'users'

router.post('/', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }
  
    const list = await User.find({}).sort('-createdAt')
      .populate({
        path: 'rolesID',
        model: Role,
        select: 'name color'
      })

    return res.json({ 
      success: true,
      usersList: list.sort(doc1 => !doc1.baseUser ? -1 : null)
    })
    
  } catch (error) {
    console.error('/users => ', error)
    return res.json({ error })
  }
})

router.post('/getOne', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id } = req.body
    if (!id) return res.json({ error: 'User ID is required' })
  
    const user = await User.findById(id)
      .populate({
        path: 'rolesID',
        model: Role,
        select: 'name color',
      })

    const projectsIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('access')
    const projects = await Project.find({
      _id: { $in: projectsIDs || [] },
    }).sort('-createdAt').select('name type')

    return res.json({ 
      success: true,
      user,
      projects,
    })
    
  } catch (error) {
    console.error('/users/getOne => ', error)
    return res.json({ error })
  }
})

router.post('/updateSelectedData', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id, status, project } = req.body
    console.log({ id, status, project });
    if (!id) return res.json({ error: 'User ID is required' })
  
    await User.updateOne({ _id: id }, {
      $set: {
        startedProject: project,
        accessStatus: status,
      }
    })

    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/users/updateSelectedData => ', error)
    return res.json({ error })
  }
})

router.post('/create', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    } 
  
    await User.create(req.body)
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/users/create => ', error)
    return res.json({ error })
  }
})

router.post('/edit', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id, userData } = req.body
    if (!id) return res.json({ error: 'User ID is required' })
  
    await User.findByIdAndUpdate(id, userData)

    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/users/edit => ', error)
    return res.json({ error })
  }
})

router.post('/remove', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    } 

    const { id } = req.body

    if (!id) {
      res.json({ error: 'ID is required' })
      return
    }

    const user = await User.findById(id)
    if (user?.baseUser) return res.json({ error: 'Unable to remove base user' })
  
    await user.deleteOne()
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/users/remove => ', error)
    return res.json({ error })
  }
})

export default router