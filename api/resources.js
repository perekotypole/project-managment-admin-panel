import osUtils from 'os-utils';
import checkDiskSpace from 'check-disk-space';
import cron from 'node-cron';

import { Router } from 'express';
import { Resources } from './models/index';
import { dataAccess } from './middleware/index';
import { formatBytes, getCPUUsage, getNetworkSpead } from './helpers/resources';

const router = Router();
const accessSlug = 'resources';

const path = osUtils.platform() === 'win32' ? 'c:' : '/';
const numberOfData = 40;

const remodeOldRecords = async (days = 2) => {
  const date = new Date();
  date.setDate(date.getDate() - days);

  await Resources.deleteMany({ createdAt: { $lt: date } });
};

cron.schedule('0 * * * *', async () => {
// cron.schedule('0 * * * * *', async () => {
  await remodeOldRecords();

  await Resources.create({
    cpu: await getCPUUsage(),
    memory: osUtils.freemem(),
    network: (await getNetworkSpead()).mbps,
  });
});

router.post('/', dataAccess, async (req, res) => {
  try {
    const access = req.blocks.map(({ slug }) => slug).includes(accessSlug);
    if (!access) {
      return res.json({ error: 'No access' });
    }

    await remodeOldRecords();

    const disk = await checkDiskSpace(path);
    const cpuHistory = [];
    const memoryHistory = [];
    const networkHistory = [];

    const records = await Resources.find({}).sort('-createdAt');
    records.forEach((record, i) => {
      if (i > numberOfData) return;

      cpuHistory.unshift({
        usage: record.cpu,
        time: record.createdAt,
      });

      memoryHistory.unshift({
        usage: formatBytes(record.memory || 0, 1, 4),
        time: record.createdAt,
      });

      networkHistory.unshift({
        usage: record.network,
        time: record.createdAt,
      });
    });

    const memorytotal = formatBytes(osUtils.totalmem(), 1, 4);

    return res.json({
      success: true,
      resources: {
        disk: {
          b: {
            total: disk.size,
            usage: disk.size - disk.free,
          },
          mb: {
            total: formatBytes(disk.size, 2),
            usage: formatBytes(disk.size - disk.free, 2),
          },
          gb: {
            total: formatBytes(disk.size, 3, 4),
            usage: formatBytes(disk.size - disk.free, 3, 4),
          },
        },
        cpu: {
          current: {
            usage: await getCPUUsage(),
            time: new Date(),
          },
          history: cpuHistory,
        },
        memory: {
          total: memorytotal,
          current: {
            usage: memorytotal - formatBytes(osUtils.freemem(), 1, 4),
            time: new Date(),
          },
          history: memoryHistory,
        },
        network: {
          current: {
            usage: (await getNetworkSpead()).mbps,
            time: new Date(),
          },
          history: networkHistory,
        },
      },
    });
  } catch (error) {
    console.error('/resources => ', error);
    return res.json({ error });
  }
});

router.post('/now', dataAccess, async (req, res) => {
  try {
    const access = req.blocks.map(({ slug }) => slug).includes(accessSlug);
    if (!access) {
      return res.json({ error: 'No access' });
    }

    return res.json({
      success: true,
      resources: {
        time: new Date(),
        cpu: await getCPUUsage(),
        memory: formatBytes(osUtils.totalmem(), 1, 4) - formatBytes(osUtils.freemem(), 1, 4),
        network: (await getNetworkSpead()).mbps,
      },
    });
  } catch (error) {
    console.error('/resources => ', error);
    return res.json({ error });
  }
});

export default router;
