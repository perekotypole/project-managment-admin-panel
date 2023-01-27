import { Box, Button, Divider, Link } from '@mui/material';
import axios from '../tools/axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

const defaultNav = [
  {
    title: 'Dashboard',
    link: '/'
  },
]

const Header = ({ onlyLogout = false }) => {
  const router = useRouter()
  const [accessPages, setAccessPages] = useState([]);
  const [projectsLinks, setProjectsLinks] = useState([]);
  
  const navigation = useMemo(() => [...defaultNav, ...accessPages], [accessPages]);

  const getPages = async () => {
    const { data: result } = await axios.post('/access/getPages')
    if (!result?.success) return

    setAccessPages(result.pages)
    setProjectsLinks(result.projects)
  }

  useEffect(() => {
    getPages()
  }, []);

  const onLogout = async () => {
    const { data: result } = await axios.post('/auth/logout',)
    if (result?.success) return router.push('/login');
  }

  const NavLink = ({children, active, sx, ...prors}) => <Link
    color="inherit"
    underline="none"
    title={children}

    {...prors}

    sx={{
      textAlign: 'center',
      fontWeight: active ? 600: 'inherit',
      '&:hover': {
        fontWeight: 600,
      },
      '&::after': {
        display: 'block',
        content: 'attr(title)',
        fontWeight: 600,
        height: '1px',
        color: 'transparent',
        overflow: 'hidden',
        visibility: 'hidden',
      },
      ...sx,
    }}
  >{children}</Link>

  return <Box
    sx={{
      width: '100%',
      overflowY: 'hidden',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        minWidth: '100%',
        gap: '2vw',
        alignItems: 'center'
      }}
    >
      {!onlyLogout && <>
        { navigation.map(({ title, link }, index) => <NavLink
          active={link.split('/')[1] === router.pathname.split('/')[1]}
          href={link}
          key={`link-${index}`}
        >
          {title}
        </NavLink>) }

        <Divider sx={{ height: '2em', width: '1px', borderWidth: '1px' }}/>

        { projectsLinks.map(({ _id, name }) => <NavLink
          active={router.query.project === _id}
          href={`/?project=${_id}`}
          key={`project-${_id}`}
        >
          {name}
        </NavLink>) }
      </>}

      <Button
        onClick={onLogout}
        sx={{
          marginLeft: 'auto'
        }}
      >Logout</Button>
    </Box>
  </Box>
}

export default Header