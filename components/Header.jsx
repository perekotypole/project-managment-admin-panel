import { Box, Button, Link } from '@mui/material';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

const defaultNav = [
  {
    title: 'Dashboard',
    link: '/'
  },
]

const Header = () => {
  const router = useRouter()
  const [accessPages, setAccessPages] = useState([]);
  
  const navigation = useMemo(() => [...defaultNav, ...accessPages], [accessPages]);

  const getPages = async () => {
    const { data: result } = await axios.post('/api/access/getPages')
    if (!result?.success) return

    setAccessPages(result.pages)
  }

  useEffect(() => {
    getPages()
  }, []);

  const onLogout = async () => {
    const { data: result } = await axios.post('/api/auth/logout',)
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
      { navigation.map(({ title, link }, index) => <NavLink
        active={link.split('/')[1] === router.pathname.split('/')[1]}
        href={link}
        key={`link-${index}`}
      >
        {title}
      </NavLink>) }

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