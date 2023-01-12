import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import {
  Box, Button, Checkbox, Chip, Divider, IconButton, Link, List, ListItem,
  ListItemButton, Paper, Stack, TextField, Typography
} from "@mui/material"
import { Add, Delete, Edit, Replay } from "@mui/icons-material";

import Layout from "../../components/Layout"
import Modal from "../../components/Modal";
import Role from "../../components/Role";

const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [roleDetails, setRoleDetails] = useState();
  
  const [filter, setFilter] = useState();
  const filterList = useMemo(() => filter
    ? rolesList.filter(({ name }) => name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    : rolesList
  , [rolesList, filter])

  const fetchRoles = async () => {
    const { data: result } = await axios.post('/api/roles')
    if (!result.success) return

    const { rolesList: data } = result
    setRolesList(data)
  }
  const fetchRoleDetail = async () => {
    const { data: result } = await axios.post('/api/roles/getOne', { id: selectedRole })
    if (!result.success) return

    const { role } = result
    setRoleDetails(role)
  }
  useEffect(() => {
    if (!rolesList.length) fetchRoles()
  }, []);
  useEffect(() => {
    if (selectedRole) fetchRoleDetail()
  }, [selectedRole]);

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

    await axios.post('/api/roles/remove', { id: elemOnRemove._id })
    fetchRoles()

    setRoleDetails(null)
    setSelectedRole(null)

    handleModalClose()
  }

  return <Layout>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 3fr',
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
        <TextField size="small" variant="outlined"  fullWidth
          label="Search" onChange={(e) => setFilter(e.target.value)} />

        <Box sx={{
          height: '100%',
          overflowY: 'auto'
        }}>
          <List>
            {filterList.map((el => (
              <ListItem disablePadding key={el._id}>
                <ListItemButton
                  selected={selectedRole === el._id}
                  onClick={() => setSelectedRole(el._id)}
                >
                  <Role sx={{ fontSize: '1em' }} color={el.color}>{el.name}</Role>
                </ListItemButton>
              </ListItem>
            )))}
          </List>
        </Box>

        <Button href="/roles/add" fullWidth variant='outlined'><Add/></Button>
      </Paper>

      <Box sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '1fr auto'
      }}>
        {roleDetails && <Box>
          <Stack direction='row' spacing={1} justifyContent='space-between'>
            <Typography variant='h5'>{roleDetails.name}</Typography>

            <Stack direction="row">
              <IconButton href={`/roles/${roleDetails._id}`}><Edit /></IconButton>
              { rolesList.length > 1 && 
                <IconButton onClick={() => removeRole(roleDetails)}><Delete /></IconButton>
              }
            </Stack>
          </Stack>

          { roleDetails.description && <>
            <Typography variant='body2'><i>Description</i>: {roleDetails.description}</Typography>
          </>}
          <Typography variant='body2'><i>Created</i>: {new Date(roleDetails.createdAt).toLocaleString('uk-UA')}</Typography>
          <Divider sx={{ my: 2 }} />

          { !!roleDetails.blocks?.length && <Box>
            <Typography variant='subtitle1'>Dashboard blocks:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.blocks.map(el =>
                <Chip key={el._id} label={el.title} variant="outlined" />
              )}
            </Stack>
          </Box> }

          { !!roleDetails.content?.length && <Box>
            <Typography variant='subtitle1'>Content {'[ pages ]'}:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.content.map(el => 
                <Link key={el._id} href={el.link} sx={{ cursor: 'pointer' }}>
                  <Chip label={el.title} variant="outlined" />
                </Link>
              )}
            </Stack>
          </Box> }

          { !!roleDetails.access?.length && <Box>
            <Typography variant='subtitle1'>Projects:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.access.map(el =>
                <Chip key={el._id} label={el.name} variant="outlined" />
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

export default RolesPage