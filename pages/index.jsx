import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Card, CardActionArea, CardContent, Typography,
} from '@mui/material';
import axios from '../tools/axios';

import Dashboard from '../components/mainPages/Dashboard.jsx';
import Project from '../components/mainPages/Project.jsx';
import StatusPayment from '../components/mainPages/StatusPayment.jsx';

const Home = () => {
  const router = useRouter();

  if (router.query.status) return <StatusPayment />;
  if (router.query.project) return <Project />;

  const [projectsLinks, setProjectsLinks] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const getPages = async () => {
    const { data: result } = await axios.post('/access/getPages');
    if (!result?.success) {
      console.error(result.error || result);
      return;
    }

    setProjectsLinks(result.projects);
  };

  const getBlocks = async () => {
    const { data: result } = await axios.post('/access/getBlocks');
    if (!result?.success) {
      console.error(result.error || result);
      return;
    }

    if (!result.blocks?.length) getPages();
    else setBlocks(result.blocks);
  };

  useEffect(() => {
    getBlocks();
  }, []);

  return <>
    {blocks?.length
      ? <Dashboard data={blocks} />
      : <>
        <Box display='flex' flexWrap='wrap' gap={3} sx={{ m: 1 }} >
          {projectsLinks.map(({ _id, name }) => <Card key={`${name}-${_id}`}
              sx={{
                width: 345,
                height: 120,
                '@media screen and (max-width: 790px)': {
                  width: '100%',
                },
              }}
              onClick={() => { router.push(`/?project=${_id}`); }}
            >
              <CardActionArea sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" textAlign='center'>
                    {name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>)}
        </Box>
      </>}

  </>;
};

export default Home;
