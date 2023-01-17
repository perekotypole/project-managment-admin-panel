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
      usersList: list
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

router.post('/getAllContent', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }
  
    const pages = await Content.find({ type: 'page'}).select('_id title')
    const blocks = await Content.find({ type: 'block'}).select('_id title')
    const projects = await Project.find({}).sort('-createdAt').select('_id name')
  
    return res.json({ 
      success: true,
      pages,
      blocks,
      projects
    })
    
  } catch (error) {
    console.error('/users/getAllContent => ', error)
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
  
    await Role.create(req.body)
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/role/create => ', error)
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

    const { id, roleData } = req.body
    if (!id) return res.json({ error: 'Project ID is required' })
  
    await Role.findByIdAndUpdate(id, roleData)

    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/projects/edit => ', error)
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
  
    await User.updateMany({ rolesID: id }, { $pull: { rolesID: id } })
    await Role.findByIdAndDelete(id)
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/users/remove => ', error)
    return res.json({ error })
  }
})

export default router