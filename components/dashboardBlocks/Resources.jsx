import { useEffect, useMemo, useState } from "react";
import axios from "../../tools/axios";

import { Box, Switch, Typography } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { formatDate } from "../../tools/functions";

const numberOfData = 40
const defaultFill = () => {
  const autofill = new Array(numberOfData).fill(null).map(_ => ({ usage: 0, time: '' }))

  return {
    cpu: autofill,
    memory: autofill,
    network: autofill,
  }
}

const Resources = ({ }) => {
  const [data, setData] = useState(null)
  const [disk, setDisk] = useState([])
  const [totals, setTotals] = useState({})
  const [realTime, setRealTime] = useState(false)

  useEffect(() => {
    let intervalId;
    setData(null)

    if (realTime) {
      getRealtimeData()
      intervalId = setInterval(() => {
        getRealtimeData()
      }, 2000);
    } else {
      getData()
    }

    return () => clearTimeout(intervalId);
  }, [realTime])

  const getRealtimeData = async () => {
    const { data: result } = await axios.post('/resources/now')
    if (!result?.success) return console.error(result.error || result);

    const { resources } = result
    const cpu = {
      usage: Math.round(+resources.cpu * 100),
      time: formatDate(new Date(resources.time), true)
    }
    const memory = {
      usage: (+resources.memory).toFixed(2),
      time: formatDate(new Date(resources.time), true)
    }
    const network = {
      usage: +resources.network,
      time: formatDate(new Date(resources.time), true)
    }

    setData(prev => {
      let data = prev
      if (!data) data = defaultFill()

      return {
        cpu: [...data.cpu, cpu].slice(-numberOfData),
        memory: [...data.memory, memory].slice(-numberOfData),
        network: [...data.network, network].slice(-numberOfData),
      }
    })
  }

  const getData = async () => {
    const { data: result } = await axios.post('/resources')
    if (!result?.success) return console.error(result.error || result);

    const { resources } = result
    setData({
      cpu: resources?.cpu ? [...resources.cpu.history, resources.cpu.current].map(el => ({
        usage: Math.round(+el.usage * 100),
        time: formatDate(new Date(el.time))
      })) : [],
      memory: resources?.memory ? [...resources.memory.history, resources.memory.current].map(el => ({
        usage: (+el.usage).toFixed(2),
        time: formatDate(new Date(el.time))
      })) : [],
      network: resources?.network ? [...resources.network.history, resources.network.current].map(el => ({
        usage: +el.usage,
        time: formatDate(new Date(el.time))
      })) : [],
    })

    setTotals({
      memory: +(+resources.memory.total).toFixed(2) || 0,
      disk: (+resources.disk.gb.total) || 0,
    })
    setDisk(resources?.disk ? [resources.disk.gb].map(el => ({
      usage: (+el.usage).toFixed(2)
    })) : [])
  }

  if (!data) return <>Loading...</>

  return <>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 100px',
        gridTemplateRows: 'repeat(3, 200px)',
        gap: 'min(25px, 2vw)',
      }}
    >
      <div style={{ gridArea: '1 / 1 / 2 / 2', display: 'grid' }}>
        <Typography variant="h5">CPU (%)</Typography>

        <div style={{ marginLeft: '-25px' }}>
          <ResponsiveContainer>
            <AreaChart
              width={500}
              height={150}
              data={data.cpu}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis orientation='left' domain={[0, 100]} />
              <Tooltip />
              <Area type="monotone" isAnimationActive={false} dataKey="usage" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ gridArea: '2 / 1 / 3 / 2', display: 'grid' }}>
        <Typography variant="h5">Memory (gb)</Typography>

        <div style={{ marginLeft: '-25px' }}>
          <ResponsiveContainer>
            <AreaChart
              width={500}
              height={150}
              data={data.memory}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis orientation='left'
                domain={[0, (Math.ceil(totals.memory) || 'auto')]}
              />
              <Tooltip />
              <Area type="monotone" isAnimationActive={false} dataKey="usage" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ gridArea: '3 / 1 / 4 / 2', display: 'grid' }}>
        <Typography variant="h5">Network (mbps)</Typography>

        <div style={{ marginLeft: '-25px' }}>
          <ResponsiveContainer>
            <AreaChart
              width={500}
              height={150}
              data={data.network}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" hide />
              <YAxis orientation='left' />
              <Tooltip />
              <Area type="monotone" isAnimationActive={false} dataKey="usage" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ gridArea: '1 / 2 / 4 / 3', display: 'grid' }}>
        <Switch
          sx={{ marginLeft: 'auto' }}
          checked={realTime}
          onChange={() => setRealTime(p => !p)}
        />

        <Typography variant="h5">Disk (gb)</Typography>

        <div style={{ marginLeft: '-25px' }}>
          <ResponsiveContainer>
            <BarChart data={disk}>
              <CartesianGrid strokeDasharray="3 3" />
              <YAxis domain={[0, Math.ceil(totals.disk)]} />
              <Bar dataKey="usage" fill="#8884d8" label={{ position: 'top' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Box>
  </>
}

export default Resources