import { Router } from 'express';
import {
  Project, Role, Session, User,
} from './models/index';
import { generateToken } from './helpers/index';
import { verifyUser } from './middleware/index';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const error = {};
    if (!login) error.login = 'Login is required';
    if (!password) error.password = 'Login is required';

    if (Object.keys(error).length) return res.json(error);

    const userExists = await User.findOne({ login });
    if (!userExists) {
      return res.json({
        error: {
          login: 'The user is not registered',
        },
      });
    }

    const passwordCheck = await User.findOne({ login, password });
    if (!passwordCheck) {
      return res.json({
        error: {
          password: 'Password is not valid',
        },
      });
    }

    const additionalData = {
      ip: req.ip,
      useragent: req.headers['user-agent'],
      acceptLanguage: req.headers['accept-language'],
    };

    req.session.tokens = await generateToken(req.sessionID, userExists.id, additionalData);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('/auth/login => ', error);
    return res.json({ error });
  }
});

router.post('/logout', verifyUser, async (req, res) => {
  try {
    req.session.destroy();

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error('/auth/logout => ', error);
    return res.json({ error });
  }
});

router.post('/remoteAuth', async (req, res) => {
  try {
    const { projectToken } = req.body;
    // const additionalData = {
    //   ip: req.ip,
    //   useragent: req.headers['user-agent'],
    //   acceptLanguage: req.headers['accept-language'],
    // }
    const { additionalData } = req.body;

    const authData = await Session.findOne({ additionalData });
    if (!authData) return res.json({ access: false });

    const user = await User.findById(authData.userID);
    const projectsIDs = await Role.find({ _id: { $in: user.rolesID } }).distinct('access');
    const project = await Project.findOne({ _id: { $in: projectsIDs }, token: projectToken });

    return res.json({ access: !!project });
  } catch (error) {
    console.error('/auth/remoteAuth => ', error);
    return res.json({ error });
  }
});

export default router;
