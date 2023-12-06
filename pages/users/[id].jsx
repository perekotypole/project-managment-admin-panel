import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { Autorenew, Save as SaveIcon } from '@mui/icons-material';
import {
  Avatar, Box, Button, Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  Paper, TextField, Typography, Stack, OutlinedInput, IconButton,
} from '@mui/material';

import md5 from 'md5';
import { generateToken } from '../../tools/functions';

import Modal from '../../components/Modal.jsx';
import Role from '../../components/Role.jsx';
import axios from '../../tools/axios';

const EditUser = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { register, handleSubmit } = useForm({});

  const Input = ({ children, ...props }) => <TextField
    {...register(props.name)}
    {...props}
    fullWidth
    variant="outlined"
  >{children}</TextField>;

  const [formData, setFormData] = useState({});
  const [base, setBase] = useState(false);
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [rolesList, setRolesList] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);

  const [filterRoles, setFilterRoles] = useState();
  const filterRolesList = useMemo(
    () => (filterRoles
      ? rolesList.filter(({ name }) => name.toLowerCase().indexOf(filterRoles.toLowerCase()) !== -1)
      : rolesList),
    [rolesList, filterRoles],
  );

  const fetchData = async () => {
    const { data: result } = await axios.post('/users/getOne', { id });
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    const { user } = result;

    setBase(user.baseUser);
    setFormData({
      username: user.username,
      login: user.login,
      description: user.description,
      rolesID: user.rolesID.map((el) => el.id),
    });
  };

  const fetchRoles = async () => {
    const { data: result } = await axios.post('/roles');
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    const { rolesList: list } = result;
    setRolesList(list);
  };

  const checkData = (d) => {
    const data = d;
    const errors = {};
    setFormErrors(errors);

    data.password = password;

    if (!data.username) errors.username = 'Userame is required';
    if (!data.login) errors.login = 'Login is required';
    // if (!data.password) data.password = setPassword(generateToken(12))

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setFormData({
      username: data.username,
      description: data.description,
      login: data.login,
      password: password ? md5(password) : null,
      rolesID: selectedRoles,
    });
    handleOpen();
  };

  const onSubmit = async () => {
    const { data: result } = await axios.post('/users/edit', { id, userData: formData });
    if (!result.success) {
      console.error(result.error || result);
      handleClose();
      return;
    }

    router.back();
  };

  useEffect(() => {
    if (id) {
      fetchRoles();
      fetchData(id);
    }
  }, [id]);

  useEffect(() => {
    if (!Object.keys(formData).length) return;

    setLoading(false);

    // setPassword(formData.password)
    setSelectedRoles(formData.rolesID);
  }, [formData]);

  return <>
    <Box
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateRows: '1fr auto',
        gap: 1,
      }}
    >
      {!loading
        && <>
          <form style={{ heigth: '100%' }}>
            <Grid container spacing={6} alignItems="flex-start" justifyContent='start'>
              <Grid container spacing={2} item md={6} sm={12}>
                <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignContent: 'center' }}>
                  <Typography variant="h5">Main info</Typography>
                </Grid>

                <Grid item xs={12}>
                  <Stack direction={'row'} spacing={2}>
                    <Avatar sx={{ width: 56, height: 56 }} />
                    <Input name="username" label="Username"
                      defaultValue={formData.username}
                      error={formErrors.username} helperText={formErrors.username} />
                  </Stack>
                </Grid>

                <Grid item xs={6} >
                  <Input name="login" label="Login"
                    defaultValue={formData.login}
                    error={formErrors.login} helperText={formErrors.login} />
                </Grid>
                <Grid item xs={6} >
                  <FormControl fullWidth variant="outlined" >
                    <InputLabel>Password</InputLabel>
                    <OutlinedInput
                      name="password"
                      label="Password"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); }}
                      endAdornment={
                        <IconButton edge="end" onClick={() => setPassword(generateToken(12))}>
                          <Autorenew />
                        </IconButton>
                      }
                    />
                  </FormControl>
                </Grid>

                <Grid item xs={12} >
                  <Input name="description" label="Description"
                    defaultValue={formData.description}
                    multiline rows={4}
                  />
                </Grid>
              </Grid>

              <Grid item md={6} sm={12}>
                <Typography variant="h5">Roles</Typography>
                <Divider sx={{ my: 2 }} />

                <Paper sx={{
                  m: 1,
                  p: 2,
                  maxHeight: '350px',
                  overflowY: 'auto',
                }}>
                  <TextField size="small" variant="outlined" fullWidth
                    label="Search" onChange={(e) => setFilterRoles(e.target.value)} />

                  <Box sx={{
                    height: '100%',
                    overflowY: 'auto',
                  }}>
                    <List>
                      {filterRolesList.map(((el) => (
                        <ListItem disablePadding key={el.id}>
                          <ListItemButton
                            selected={selectedRoles.includes(el.id)}
                            disabled={base && el.baseRole}
                            onClick={() => {
                              if (selectedRoles.includes(el.id)) {
                                setSelectedRoles(selectedRoles.filter((i) => i !== el.id));
                              } else {
                                setSelectedRoles([...selectedRoles, el.id]);
                              }
                            }}
                          >
                            <Role sx={{ fontSize: '1em' }} color={el.color}>{el.name}</Role>
                          </ListItemButton>
                        </ListItem>
                      )))}
                    </List>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </form>

          <Box sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1,
          }}>
            <Button onClick={handleSubmit(checkData)}><SaveIcon /></Button>
          </Box>
        </>
      }
    </Box>

    <Modal
      open={open}
      onClose={handleClose}
      onCancel={handleClose}
      onSubmit={onSubmit}
    >Confirm changes?</Modal>
  </>;
};

export default EditUser;
