import axios from '../tools/axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { Card, CardActionArea, CardContent, Typography } from '@mui/material';

import Blocks from '../components/blocks/Blocks';
import Layout from '../components/Layout';
import Project from '../components/mainPages/Project';
import StatusPayment from '../components/mainPages/StatusPayment';
import { Box } from '@mui/system';

const Home = () => {
  const router = useRouter()

  if (router.query.status) return <StatusPayment />
  if (router.query.project) return <Project />

  const [projectsLinks, setProjectsLinks] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const getBlocks = async () => {
    const { data: result } = await axios.post('/access/getBlocks')
    if (!result?.success) return console.error(result.error || result);

    if (!result.blocks?.length) getPages()
    else setBlocks(result.blocks)
  }
  const getPages = async () => {
    const { data: result } = await axios.post('/access/getPages')
    if (!result?.success) return console.error(result.error || result);

    setProjectsLinks(result.projects)
  }

  useEffect(() => {
    getBlocks()
  }, []);

  return <Layout>
    {blocks?.length
      ? <Blocks data={blocks} />
      : <>
        <Box display='flex' flexWrap='wrap' gap={3} sx={{ m: 1 }} >
          {projectsLinks.map(({ _id, name }) =>
            <Card key={`${name}-${_id}`}
              sx={{
                width: 345, height: 120,
                '@media screen and (max-width: 790px)': {
                  width: '100%',
                }
              }} 
              onClick={() => { router.push(`/?project=${_id}`) }}
            >
              <CardActionArea sx={{
                width: '100%', height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" textAlign='center'>
                    {name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          )}
        </Box>
      </>}

  </Layout>
}

export default Home