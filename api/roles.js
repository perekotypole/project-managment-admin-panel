import { Router } from 'express'
import { Content, Project, Role, User } from './models/index.js'
import { dataAccess } from './middleware/index.js'

const router = Router()
const accessSlug = 'roles'
const usersAccessSlug = 'users'

router.post('/', dataAccess, async (req, res) => {
  try {
    const access = req.access.map(({slug}) => slug)
      .some(e => [accessSlug, usersAccessSlug].includes(e))
    if (!access) {
      res.redirect('/')
      return
    }
  
    const list = await Role.find({})
      .sort('-createdAt')
      .select('name color baseRole')

    return res.json({ 
      success: true,
      rolesList: list.sort(doc1 => !doc1.baseRole ? -1 : null)
    })
    
  } catch (error) {
    console.error('/roles => ', error)
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
    if (!id) return res.json({ error: 'Role ID is required' })
  
    const role = await Role.findById(id)
      .populate({
        path: 'content blocks',
        model: Content,
      })
      .populate({
        path: 'access',
        model: Project,
      })

    return res.json({ 
      success: true,
      role
    })
    
  } catch (error) {
    console.error('/roles/getOne => ', error)
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
    console.error('/roles/getAllContent => ', error)
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
    console.error('/roles/create => ', error)
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
    console.error('/roles/edit => ', error)
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
    if (!id) return res.json({ error: 'ID is required' })
  
    const role = await Role.findById(id)
    if (role.baseRole) return res.json({ error: 'Unable to remove base role' })
    
    await User.updateMany({ rolesID: id }, { $pull: { rolesID: id } })
    await role.deleteOne()
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/roles/remove => ', error)
    return res.json({ error })
  }
})

export default router