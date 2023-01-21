import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box, Button, Checkbox, Chip, Divider, IconButton, Link, List, ListItem,
  ListItemButton, ListItemText, Paper, Stack, TextField, Typography
} from "@mui/material"
import { Add, Delete, Edit, Replay, Save } from "@mui/icons-material";

import Layout from "../../components/Layout"
import Modal from "../../components/Modal";
import Role from "../../components/Role";
import CopyText from "../../components/CopyText";

const accessStatusList = [
  { title: 'Nothing', slug: null },
  { title: 'Blocked account', slug: 'blocked' },
  { title: 'Waiting for payment', slug: 'payment' },
  { title: 'In development', slug: 'development' },
]

const UsersPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [userDetails, setUserDetails] = useState();

  const [projectsList, setProjectsList] = useState([]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  const [filter, setFilter] = useState();
  const filterList = useMemo(() => filter
    ? usersList.filter(({ username }) =>
      username.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    : usersList
    , [usersList, filter])

  const fetchUsers = async () => {
    const { data: result } = await axios.post('/api/users')
    if (!result.success) return

    const { usersList: data } = result
    setUsersList(data)
  }
  const fetchUserDetail = async () => {
    const { data: result } = await axios.post('/api/users/getOne', { id: selectedUser })
    if (!result.success) return

    const { user, projects } = result
    setUserDetails({
      ...user,
      startedProject: user.startedProject || null,
      accessStatus: user.accessStatus || null,
    })
    setSelectedProject(user.startedProject || null)
    setSelectedStatus(user.accessStatus || null)

    setProjectsList(projects)
  }

  useEffect(() => {
    if (!usersList.length) fetchUsers()
  }, []);
  useEffect(() => {
    if (selectedUser) fetchUserDetail()
  }, [selectedUser]);

  const [open, setOpen] = useState(false)
  const handleModalOpen = () => setOpen(true)
  const handleModalClose = () => setOpen(false)

  const [elemOnRemove, setElemOnRemove] = useState(null)
  const [nameForRemoval, setNameForRemoval] = useState('')
  const [removalRole, setRemovalRole] = useState(null)

  useEffect(() => {
    if (!open) {
      setElemOnRemove(null)
      setNameForRemoval('')
      setRemovalRole(null)
    }
  }, [open]);

  const removeRole = (elem) => {
    setElemOnRemove(elem)
    handleModalOpen()
  }

  const comfirmRemove = async () => {
    if (elemOnRemove.name !== nameForRemoval) {
      setRemovalRole('Values don`t match')
      return
    }

    await axios.post('/api/users/remove', { id: elemOnRemove._id })
    fetchUsers()

    setUserDetails(null)
    setSelectedUser(null)

    handleModalClose()
  }

  const saveChanged = async () => {
    await axios.post('/api/users/updateSelectedData', {
      id: selectedUser,
      status: selectedStatus,
      project: selectedProject,
    })
    
    setUserDetails({
      ...userDetails,
      startedProject: selectedProject,
      accessStatus: selectedStatus,
    })
  }

  return <Layout>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '2fr 3fr',
      '@media screen and (max-width: 780px)': {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '1fr 2fr',
      },
      gap: 4,
      height: '100%',
    }}>
      <Paper sx={{
        m: 1, p: 2,
        overflow: 'hidden',
        maxHeight: 'calc(100% - 16px)',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: 1,
      }}>
        <TextField size="small" variant="outlined" fullWidth
          label="Search" onChange={(e) => setFilter(e.target.value)} />

        <Box sx={{
          height: '100%',
          overflowY: 'auto'
        }}>
          <List>
            {filterList.map(((el, i) => (
              <div key={el._id}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedUser === el._id}
                    onClick={() => setSelectedUser(el._id)}
                    sx={{ px: 1 }}
                  >
                    <Stack direction={'row'} spacing={1}>
                      <Avatar src={userDetails?.image} />

                      <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ pl: .5 }}>
                          {el.username}
                        </Typography>

                        <Box display={'flex'} sx={{ gap: 1 }}>
                          {el.rolesID.map((role => (
                            <Role key={role._id} color={role.color}>{role.name}</Role>
                          )))}
                        </Box>
                      </Box>
                    </Stack>
                  </ListItemButton>
                </ListItem>

                {i !== filterList.length - 1 &&
                  <Divider sx={{ width: '100%', my: 1 }} />
                }
              </div>
            )))}
          </List>
        </Box>

        <Button href="/users/add" fullWidth variant='outlined'><Add /></Button>
      </Paper>

      <Box sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '1fr auto'
      }}>
        {userDetails && <Box>
          <Stack direction='row' spacing={1} justifyContent='space-between'>
            <Typography variant='h5'>{userDetails.username}</Typography>

            <Stack direction="row">
              <IconButton href={`/users/${userDetails._id}`}><Edit /></IconButton>
              {!userDetails.baseUser &&
                <IconButton onClick={() => removeRole(userDetails)}><Delete /></IconButton>
              }
            </Stack>
          </Stack>

          <Box display={'flex'} sx={{ gap: 1, mb: 1 }}>
            {userDetails.rolesID.map((role => (
              <Role key={role._id} color={role.color}>{role.name}</Role>
              )))}
          </Box>

          <Box>
            <Typography variant='body2'>
              <b>Login: </b>
              <CopyText>{userDetails.login}</CopyText>
            </Typography>
            <Typography variant='body2'>
              <b>Password: </b>
              <CopyText>{userDetails.password}</CopyText>
            </Typography>
          </Box>

          {userDetails.baseUser && <Typography variant='body2'><i>(Base user for initial management)</i></Typography>}

          { userDetails.description && <>
            <Typography variant='body2'><i>Description</i>: {userDetails.description}</Typography>
          </>}

          {!userDetails.baseUser &&
            <>
              <Typography variant='body2'><i>Created</i>: {new Date(userDetails.createdAt).toLocaleString('uk-UA')}</Typography>
              <Divider sx={{ my: 2 }} />

              <Box
                display={'grid'}
                sx={{
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                }}
              >
                <Paper sx={{
                  m: 1, p: 2,
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  <List subheader={
                    <Typography variant='h6'>Access status</Typography>
                  }>
                    {accessStatusList.map((el => (
                      <ListItem disablePadding key={el.slug || 'nothing'}>
                        <ListItemButton
                          selected={selectedStatus == el.slug}
                          onClick={() => setSelectedStatus(el.slug || null)}
                        >
                          <ListItemText primary={el.title} />
                        </ListItemButton>
                      </ListItem>
                    )))}
                  </List>
                </Paper>

                <Paper sx={{
                  m: 1, p: 2,
                  maxHeight: '500px',
                  overflowY: 'auto'
                }}>
                  <List subheader={
                    <Typography variant='h6'>Started page</Typography>
                  }>
                    <ListItem disablePadding key={'dashboard'}>
                      <ListItemButton
                        selected={!selectedProject}
                        onClick={() => setSelectedProject(null)}
                      >
                        <ListItemText primary={'Dashboard'} />
                      </ListItemButton>
                    </ListItem>

                    {projectsList.map((el => (
                      <ListItem disablePadding key={el._id}>
                        <ListItemButton
                          disabled={el.type !== 'website'}
                          selected={selectedProject === el._id}
                          onClick={() => setSelectedProject(el._id)}
                        >
                          <ListItemText primary={el.name} />
                        </ListItemButton>
                      </ListItem>
                    )))}
                  </List>
                </Paper>
              </Box>
              
              {((selectedProject !== userDetails.startedProject)
              || (selectedStatus !== userDetails.accessStatus)) &&
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 1,
                }}>
                  <Button onClick={saveChanged}><Save/></Button>
                </Box>
              }
            </>
          }
        </Box>}
      </Box>
    </Box>

    <Modal
      open={open}
      onClose={handleModalClose}
      onCancel={handleModalClose}
      onSubmit={() => comfirmRemove()}
    >
      <div>Enter <b>{elemOnRemove?.name}</b> for comfirm removal?</div>

      <TextField
        fullWidth
        error={!!removalRole}
        helperText={removalRole}
        onChange={(e) => {
          setNameForRemoval(e.target.value)
          if (removalRole) setRemovalRole(null)
        }}
        value={nameForRemoval}
        label="Project name"
        variant="standard"
      />
    </Modal>
  </Layout>
}

export default UsersPage