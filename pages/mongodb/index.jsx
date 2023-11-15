import axios from "../../tools/axios";
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Chip, Divider, IconButton, Link, List, ListItem,
  ListItemButton, Paper, Stack, TextField, Typography
} from "@mui/material"
import { Add, Delete, Edit, Replay } from "@mui/icons-material";

import Layout from "../../components/Layout"
import Modal from "../../components/Modal";
import CopyText from '../../components/CopyText';

const DBUsersPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [DBHost, setDBHost] = useState('');
  
  const [userRoles, setUserRoles] = useState([]);
  const userDetails = useMemo(() => {
    const user = usersList.find(el => el.user === selectedUser)
    if (user) setUserRoles(user.roles)
    return user
  }, [selectedUser]);
  
  const [filter, setFilter] = useState();
  const filterList = useMemo(() => filter
    ? usersList.filter(({ title = null }) => {
      if (!title) return false
      return title.toLowerCase().indexOf(filter.toLowerCase()) !== -1
    }) : usersList
  , [usersList, filter])

  const fetchUsers = async () => {
    const { data: result } = await axios.post('/mongodb')
    if (!result.success) return console.error(result.error || result);

    const { users: data, host, port } = result
    setUsersList(data)
  }
  console.log(DBHost);
  useEffect(() => {
    if (!usersList.length) fetchUsers()
  }, []);

  const [open, setOpen] = useState(false)
  const handleModalOpen = () => setOpen(true)
  const handleModalClose = () => setOpen(false)

  const [elemOnRemove, setElemOnRemove] = useState(null)
  const [nameForRemoval, setNameForRemoval] = useState('')
  const [removalUser, setRemovalUser] = useState(null)

  useEffect(() => {
    if (!open) {
      setElemOnRemove(null)
      setNameForRemoval('')
      setRemovalUser(null)
    }
  }, [open]);

  const removeUser = (elem) => {
    setElemOnRemove(elem)
    handleModalOpen()
  }

  const comfirmRemove = async () => {
    if (elemOnRemove.user !== nameForRemoval) {
      setRemovalUser('Values don`t match')
      return
    }

    const { data: result } = await axios.post('/mongodb/removeUser', { user: elemOnRemove.user })
    if (!result.success) return console.error(result.error || result);

    fetchUsers()
    setSelectedUser(null)

    handleModalClose()
  }

  return <Layout>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 3fr',
      '@media screen and (max-width: 780px)': {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '350px auto', 
      },
      gap: 4,
      minHeight: '100%',
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
            {filterList.map((el => (
              <ListItem disablePadding key={el._id}>
                <ListItemButton
                  selected={selectedUser === el.user}
                  onClick={() => setSelectedUser(el.user)}
                >
                  {el.title || el.user}
                </ListItemButton>
              </ListItem>
            )))}
          </List>
        </Box>

        <Button href="/mongodb/add" fullWidth variant='outlined'><Add/></Button>
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
            <Typography variant='h5'>{userDetails.title}</Typography>

            <Stack direction="row" flexWrap='wrap'>
              <IconButton href={`/mongodb/${userDetails.user}`}><Edit /></IconButton>
              {!userDetails.baseRole && 
                <IconButton onClick={() => removeUser(userDetails)}><Delete /></IconButton>
              }
            </Stack>
          </Stack>

          <CopyText hideText="Copy remote connection link">{`mongodb://${userDetails.user}:${userDetails.password}@${DBHost?.[0]}:${DBHost?.[1]}/`}</CopyText>
          <CopyText hideText="Copy local connection link">{`mongodb://${userDetails.user}:${userDetails.password}@0.0.0.0:${DBHost?.[1]}`}</CopyText>

          { userDetails.description && <>
            <Typography variant='body2'><i>Description</i>: {userDetails.description}</Typography>
          </>}
          <Divider sx={{ my: 2 }} />

          { !!userRoles?.length && <Box>
            <Typography variant='subtitle1'>Databases:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {userRoles.map((el, i) =>
                <Chip key={`${el.db}-${el.role}-${i}`} label={`${el.db} | ${el.role}`} variant="outlined" />
              )}
            </Stack>
          </Box> }
        </Box>}
      </Box>
    </Box>

    <Modal
      open={open}
      onClose={handleModalClose}
      onCancel={handleModalClose}
      onSubmit={() => comfirmRemove()}
    >
      <div>Enter <b>{elemOnRemove?.user}</b> for comfirm removal?</div>

      <TextField
        fullWidth
        error={!!removalUser}
        helperText={removalUser}
        onChange={(e) => {
          setNameForRemoval(e.target.value)
          if (removalUser) setRemovalUser(null)
        }}
        value={nameForRemoval}
        label="Username"
        variant="standard"
      />
    </Modal>
  </Layout>
}

export default DBUsersPage