import { Router } from 'express'
import { Error, Project, } from './models/index.js'
import { dataAccess } from './middleware/index.js'
import { checkerAddProject, checkerRemoveProject } from './checker.js'

const router = Router()
const accessSlug = 'projects'

router.post('/', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }
  
    const list = await Promise.all(
      (await Project.find({})
      .sort('-createdAt')).map(async (el) => {
        return {
          ...el._doc,
          errorsCount: await Error.countDocuments({ projectID: el._id })
        }
      })
    )

    for (let i = 0,
      end_index = list.length - 1,
      non_working_index = 0;
    i <= end_index;) {
      const el = list[i]

      if (el?.stopped) {
        list.splice(i, 1)
        list.push(el)
        end_index--
        continue
      }

      if (!el?.status) {
        list.splice(i, 1)
        list.splice(non_working_index, 0, el);
        non_working_index++
      }

      i++
    }

    return res.json({ 
      success: true,
      projectsList: list
    })
    
  } catch (error) {
    console.error('/projects => ', error)
    return res.json({ error })
  }
})

router.post('/shortList', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }
  
    const list = await Project.find({}).sort('-createdAt').select('_id name status')

    return res.json({ 
      success: true,
      projectsList: list
    })
    
  } catch (error) {
    console.error('/projects/shortList => ', error)
    return res.json({ error })
  }
})

router.post('/getOne', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id } = req.body
    if (!id) return res.json({ error: 'Project ID is required' })
  
    const project = await Project.findById(id)

    return res.json({ 
      success: true,
      project
    })
    
  } catch (error) {
    console.error('/projects/getOne => ', error)
    return res.json({ error })
  }
})

router.post('/create', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    } 
  
    const project = await Project.create(req.body)
    checkerAddProject(project)
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/projects/create => ', error)
    return res.json({ error })
  }
})

router.post('/edit', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id, projectData } = req.body
    if (!id) return res.json({ error: 'Project ID is required' })
  
    const project = await Project.findByIdAndUpdate(id, projectData)
    checkerAddProject(project)

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
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    } 

    const { id } = req.body

    if (!id) {
      res.json({ error: 'ID is required' })
      return
    }
  
    await Error.findOneAndDelete({ projectID: id })
    const project = await Project.findByIdAndDelete(id)
    checkerRemoveProject(project.token)
  
    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/projects/remove => ', error)
    return res.json({ error })
  }
})

router.post('/switchRunningStatus', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    } 

    const { id } = req.body

    if (!id) {
      res.json({ error: 'ID is required' })
      return
    }

    const project = await Project.findById(id)
    const status = !project.stopped
    await project.updateOne({ $set: { stopped: status } })

    if (status)
      checkerAddProject(project)
    else
      checkerRemoveProject(project.token)
  
    return res.json({ 
      success: true,
      status
    })
    
  } catch (error) {
    console.error('/projects/switchRunningStatus => ', error)
    return res.json({ error })
  }
})

router.post('/errors', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }
  
    const list = await Error.find({})
      .sort('-createdAt')
      .populate({
        path: 'projectID',
        model: Project,
        select: 'name'
      })

    return res.json({ 
      success: true,
      errorsList: list
    })
    
  } catch (error) {
    console.error('/projects/errors => ', error)
    return res.json({ error })
  }
})

router.post('/error/remove', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id } = req.body
    if (!id) return res.json({ error: 'Project ID is required' })
  
    await Error.findByIdAndDelete(id)

    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/projects/error/remove => ', error)
    return res.json({ error })
  }
})

router.post('/error/removeAll', dataAccess, async (req, res) => {
  try {
    const access = req.content.map(({slug}) => slug).includes(accessSlug)
    if (!access) {
      res.redirect('/')
      return
    }

    const { id, others } = req.body

    if (id) {
      await Error.deleteMany({ projectID: id })
    } else if (others) {
      const projects_ids = await Project.find({}).distinct('_id')
      await Error.deleteMany({ projectID: { $nin: projects_ids } })
    } else {
      await Error.deleteMany({})
    }

    return res.json({ 
      success: true,
    })
    
  } catch (error) {
    console.error('/projects/error/remove => ', error)
    return res.json({ error })
  }
})

export default router