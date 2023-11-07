import os from 'os'
import NetworkSpeed from 'network-speed'

const testNetworkSpeed = new NetworkSpeed()

export const formatBytes = (bytes, pow = 0, decimals = 2) =>
  parseFloat((bytes / Math.pow(1024, pow))).toFixed(decimals)

export const getNetworkSpead = async () => {
  return await testNetworkSpeed.checkDownloadSpeed(
    'https://eu.httpbin.org/stream-bytes/500000',
    500000
  )
}

export const getCPUUsage = async () => {
  const cpuInfo1 = os.cpus();
  const totalCores = cpuInfo1.length;

  const totalIdle1 = cpuInfo1.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  const totalBusy1 = cpuInfo1.reduce((acc, cpu) => acc + (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq), 0);

  return new Promise((resolve) => {
    setTimeout(() => {
      const cpuInfo2 = os.cpus();

      const totalIdle2 = cpuInfo2.reduce((acc, cpu) => acc + cpu.times.idle, 0);
      const totalBusy2 = cpuInfo2.reduce((acc, cpu) => acc + (cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq), 0);

      const idleDiff = totalIdle2 - totalIdle1;
      const busyDiff = totalBusy2 - totalBusy1;
      const totalDiff = idleDiff + busyDiff;

      const perc = busyDiff / totalDiff

      resolve(perc);
    }, 1000);
  });
};

// export const getCPUUsage = async (free = false) => {
//   const getCPUInfo = () => {
//     const cpus = os.cpus()
//     const data = {
//       user: 0,
//       nice: 0,
//       sys: 0,
//       idle: 0,
//       irq: 0,
//       total: 0,
//     }

//     for (let cpu in cpus) {
//       data.user += cpus[cpu].times.user
//       data.nice += cpus[cpu].times.nice
//       data.sys += cpus[cpu].times.sys
//       data.irq += cpus[cpu].times.irq
//       data.idle += cpus[cpu].times.idle
//     }

//     return {
//       idle: data.idle,
//       total: data.user + data.nice + data.sys + data.idle + data.irq,
//     }
//   }

//   const stats1 = getCPUInfo()

//   return new Promise((resolve) => {
//     setTimeout(() => {
//       const stats2 = getCPUInfo()
//       const perc = (stats2.idle - stats1.idle) / (stats2.total - stats1.total)

//       resolve(free === true ? perc : (1 - perc))
//     }, 300)
//   })
// }