import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../tools/axios';
import Ifraim from '../Ifraim.jsx';

const Project = () => {
  const router = useRouter();
  const [project, setProject] = useState(null);

  const fetchProject = async (id) => {
    const { data: result } = await axios.post('/access/project', { id });
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    setProject(result.project);
  };

  useEffect(() => {
    if (!router.query?.project) return;
    const { project: id } = router.query;
    fetchProject(id);
  }, [router]);

  if (!project) return <>Loading</>;

  return <Ifraim src={project.link}/>;
};

export default Project;
