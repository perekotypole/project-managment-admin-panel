import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Chip, Divider, IconButton, Link, List, ListItem,
  ListItemButton, Paper, Stack, TextField, Typography,
} from '@mui/material';
import {
  Add, Delete, Edit,
} from '@mui/icons-material';
import axios from '../../tools/axios';

import Modal from '../../components/Modal.jsx';
import Role from '../../components/Role.jsx';

const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolesList, setRolesList] = useState([]);
  const [roleDetails, setRoleDetails] = useState();

  const [filter, setFilter] = useState();
  const filterList = useMemo(
    () => (filter
      ? rolesList.filter(({ name }) => name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
      : rolesList),
    [rolesList, filter],
  );

  const fetchRoles = async () => {
    const { data: result } = await axios.post('/roles');
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    const { rolesList: data } = result;
    setRolesList(data);
  };
  const fetchRoleDetail = async () => {
    const { data: result } = await axios.post('/roles/getOne', { id: selectedRole });
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    const { role } = result;
    setRoleDetails(role);
  };
  useEffect(() => {
    if (!rolesList.length) fetchRoles();
  }, []);
  useEffect(() => {
    if (selectedRole) fetchRoleDetail();
  }, [selectedRole]);

  const [open, setOpen] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const [elemOnRemove, setElemOnRemove] = useState(null);
  const [nameForRemoval, setNameForRemoval] = useState('');
  const [removalRole, setRemovalRole] = useState(null);

  useEffect(() => {
    if (!open) {
      setElemOnRemove(null);
      setNameForRemoval('');
      setRemovalRole(null);
    }
  }, [open]);

  const removeRole = (elem) => {
    setElemOnRemove(elem);
    handleModalOpen();
  };

  const comfirmRemove = async () => {
    if (elemOnRemove.name !== nameForRemoval) {
      setRemovalRole('Values don`t match');
      return;
    }

    const { data: result } = await axios.post('/roles/remove', { id: elemOnRemove.id });
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    fetchRoles();

    setRoleDetails(null);
    setSelectedRole(null);

    handleModalClose();
  };

  return <>
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
        m: 1,
        p: 2,
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
          overflowY: 'auto',
        }}>
          <List>
            {filterList.map(((el) => (
              <ListItem disablePadding key={el.id}>
                <ListItemButton
                  selected={selectedRole === el.id}
                  onClick={() => setSelectedRole(el.id)}
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
        gridTemplateRows: '1fr auto',
      }}>
        {roleDetails && <Box>
          <Stack direction='row' spacing={1} justifyContent='space-between'>
            <Typography variant='h5'>{roleDetails.name}</Typography>

            <Stack direction="row">
              <IconButton href={`/roles/${roleDetails.id}`}><Edit /></IconButton>
              {!roleDetails.baseRole
                && <IconButton onClick={() => removeRole(roleDetails)}><Delete /></IconButton>
              }
            </Stack>
          </Stack>

          { roleDetails.baseRole && <Typography variant='body2'><i>(Base role for initial management)</i></Typography>}

          { roleDetails.description && <>
            <Typography variant='body2'><i>Description</i>: {roleDetails.description}</Typography>
          </>}
          <Typography variant='body2'><i>Created</i>: {new Date(roleDetails.createdAt).toLocaleString('uk-UA')}</Typography>
          <Divider sx={{ my: 2 }} />

          { !!roleDetails.blocks?.length && <Box>
            <Typography variant='subtitle1'>Dashboard blocks:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.blocks.map((el) => <Chip key={el.id} label={el.title} variant="outlined" />)}
            </Stack>
          </Box> }

          { !!roleDetails.content?.length && <Box>
            <Typography variant='subtitle1'>Content {'[ pages ]'}:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.content.map((el) => <Link key={el.id} href={el.link} sx={{ cursor: 'pointer' }}>
                  <Chip label={el.title} variant="outlined" />
                </Link>)}
            </Stack>
          </Box> }

          { !!roleDetails.access?.length && <Box>
            <Typography variant='subtitle1'>Projects:</Typography>

            <Stack direction='row' spacing={1} sx={{ my: 1 }}>
              {roleDetails.access.map((el) => <Chip key={el.id} label={el.name} variant="outlined" />)}
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
          setNameForRemoval(e.target.value);
          if (removalRole) setRemovalRole(null);
        }}
        value={nameForRemoval}
        label="Project name"
        variant="standard"
      />
    </Modal>
  </>;
};

export default RolesPage;
