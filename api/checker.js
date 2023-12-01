import axios from 'axios';
import { Router } from 'express';
import { sendMessage } from './helpers/telegram';
import { Error, Project } from './models/index';

const router = Router();

const waitingRequests = {};
const makingRequests = {};
const reserveTime = 10 * 60 * 1000; // 10 min
// const reserveTime = 0

const setBadStatus = async (id) => { await Project.findByIdAndUpdate(id, { status: false }); };
const setGoodStatus = async (id) => {
  await Project.findByIdAndUpdate(id, { checkDate: new Date(), status: true });
};

const setTimeoutForWaiting = (project) => setTimeout(() => {
  setBadStatus(project.id);
  clearTimeout(waitingRequests[project.token]);
  sendMessage({
    token: project.telegram?.token,
    chatID: project.telegram?.chat,
    message: `🆘 [ ${project.name || 'Unknown project'} ]: Connection check timed out`,
  });
}, project.noExtraTime ? project.reloadTime * 1000 : reserveTime + project.reloadTime * 1000);

const request = async (project) => {
  try {
    await axios.get(project.requestLink);
    return 1;
  } catch (error) {
    if (project.status === false) return -1;
    return 0;
  }
};

const repeatRequest = async (project) => {
  await new Promise((resolve) => {
    setTimeout(async () => {
      try {
        await axios.get(project.requestLink);
        resolve(1);
      } catch (error) {
        console.error(`[${project.requestLink}]: ${error}`);
        setBadStatus(project.id);
        sendMessage({
          token: project.telegram?.token,
          chatID: project.telegram?.chat,
          message: `🆘 [ ${project.name || 'Unknown project'} ]: Connection check timed out`,
        });
        resolve(0);
      }
    }, 10000);
  });
};

const setTimeoutForRequest = async ({ id, token }) => {
  if (!id || !token) {
    makingRequests[token] = null;
    return setTimeout(() => {});
  }

  try {
    const project = await Project.findById(id);
    if (!project) {
      makingRequests[token] = null;
      return setTimeout(() => {});
    }

    const success = await request(project);
    if (!success) {
      const successRepeat = await repeatRequest(project);
      if (!successRepeat) return setTimeout(() => {});
    }

    if (project.status === false) {
      sendMessage({
        token: project?.telegram?.token,
        chatID: project?.telegram?.chat,
        message: `✅ [ ${project?.name || 'Unknown project'} ]: The connection is restored`,
      });
    }

    setGoodStatus(project.id);

    return setTimeout(() => {
      setTimeoutForRequest(project);
    }, project.reloadTime * 1000);
  } catch (error) {
    setTimeoutForRequest({ id, token });
  }
  return setTimeout(() => {});
};

export const checkerRemoveProject = (token) => {
  if (waitingRequests[token]) waitingRequests[token] = null;
  if (makingRequests[token]) makingRequests[token] = null;
};

export const checkerAddProject = (project) => {
  checkerRemoveProject(project.token);

  if (project.requestLink) makingRequests[project.token] = setTimeoutForRequest(project);
  else waitingRequests[project.token] = setTimeoutForWaiting(project);
};

export const initTimers = async () => {
  try {
    await Project.updateMany({}, { status: null });
    const projects = await Project.find({ stopped: { $ne: true } });
    projects.forEach((project) => checkerAddProject(project));
  } catch (error) {
    console.error('Init checker timers => ', error);
    process.exit(-1);
  }

  // setInterval(() => {
  //   console.log(Object.keys(waitingRequests).map(el =>
  //     [el, !waitingRequests[el]._destroyed]));
  // }, 5000);
};

router.get('/', async (req, res) => {
  try {
    const { token } = req.query;
    const project = await Project.findOne({ token });

    if (!project?.reloadTime) {
      res.status(404).json(-1);
      return {};
    }

    if (project.status === false) {
      sendMessage({
        token: project?.telegram?.token,
        chatID: project?.telegram?.chat,
        message: `✅ [ ${project?.name || 'Unknown project'} ]: The connection is restored`,
      });
    }

    setGoodStatus(project.id);
    if (waitingRequests[token]) { clearTimeout(waitingRequests[token]); }

    waitingRequests[token] = setTimeoutForWaiting(project);

    return res.status(200).json(project.reloadTime);
  } catch (error) {
    console.error('/checker => ', error);
    return res.json({ error });
  }
});

router.get('/error', async (req, res) => {
  try {
    const { token, message } = req.query;
    const project = await Project.findOne({ token });

    await Error.create({
      projectID: project?.id || null,
      message: message || 'Unknown error',
    });

    await sendMessage({
      token: project?.telegram?.token,
      chatID: project?.telegram?.chat,
      message: `⚠️ [ ${project?.name || 'Unknown project'} ]: ${message || 'Unknown error'}`,
    });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('/checker/error => ', error);
    return res.json({ error });
  }
});

export default router;
