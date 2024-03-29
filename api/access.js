import { Router } from 'express';
import { Content, Project, User } from './models/index.js';
import { dataAccess } from './middleware/index.js';

const router = Router();

router.post('/user', dataAccess, async (req, res) => {
  try {
    const { userID = null } = req.user;
    const user = await User.findById(userID).select('username image');

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('/access/user => ', error);
    return res.json({ error });
  }
});

router.post('/getPages', dataAccess, async (req, res) => {
  try {
    const pages = await Content.find({ _id: { $in: req.contentIDs } });
    const projects = await Project.find({
      _id: { $in: req.projectsIDs },
      link: { $ne: '' },
    }).select('name');

    return res.json({
      success: true,
      pages,
      projects,
    });
  } catch (error) {
    console.error('/access/getPages => ', error);
    return res.json({ error });
  }
});

router.post('/getBlocks', dataAccess, async (req, res) => {
  try {
    const blocks = await Content.find({ _id: { $in: req.blocksIDs } });

    return res.json({
      success: true,
      blocks,
    });
  } catch (error) {
    console.error('/access/getBlocks => ', error);
    return res.json({ error });
  }
});

router.post('/project', dataAccess, async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ error: 'Project ID is required' });
    if (!req.projectsIDs.map((el) => el.toString()).includes(id)) { return res.json({ error: 'No access' }); }

    const project = await Project.findById(id).select('name link type');

    return res.json({
      success: true,
      project,
    });
  } catch (error) {
    console.error('/access/project => ', error);
    return res.json({ error });
  }
});

export default router;
