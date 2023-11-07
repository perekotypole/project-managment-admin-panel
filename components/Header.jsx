import { Avatar, Box, Button, Divider, Link, Menu, MenuItem } from '@mui/material';
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
  const [user, setUser] = useState([]);
  const [accessPages, setAccessPages] = useState([]);
  const [projectsLinks, setProjectsLinks] = useState([]);
  
  const navigation = useMemo(() => [...defaultNav, ...accessPages], [accessPages]);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget)
  const handleClose = () => setAnchorEl(null)

  const fetchUser = async () => {
    const { data: result } = await axios.post('/access/user')
    if (!result?.success) return console.error(result.error || result);

    setUser(result.user)
  }

  const getPages = async () => {
    const { data: result } = await axios.post('/access/getPages')
    if (!result?.success) return console.error(result.error || result);

    setAccessPages(result.pages)
    setProjectsLinks(result.projects)
  }

  useEffect(() => {
    getPages()
    fetchUser()
  }, []);

  const onLogout = async () => {
    const { data: result } = await axios.post('/auth/logout',)
    if (!result?.success) return console.error(result.error || result);
    return router.push('/login');
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
        sx={{
          marginLeft: 'auto'
        }}
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Avatar sx={{ width: '1.5em', height: '1.5em', mr: 1 }} src={user.image} />
        {user.username}
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={onLogout}>Logout</MenuItem>
      </Menu>
    </Box>
  </Box>
}

export default Header