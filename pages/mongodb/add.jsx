import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { Save as SaveIcon } from '@mui/icons-material';
import {
  Box, Button, Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper, Select, Stack, TextField, Typography,
} from '@mui/material';
import axios from '../../tools/axios';

import Modal from '../../components/Modal.jsx';

const accesses = [
  'read',
  'readWrite',
  'dbAdmin',
  'dbOwner',
  'userAdmin',
  'clusterAdmin',
  'clusterManager',
  'clusterMonitor',
  'hostManager',
  'backup',
  'restore',
  'readAnyDatabase',
  'readWriteAnyDatabase',
  'userAdminAnyDatabase',
  'dbAdminAnyDatabase',
  'root',
];

const AddDBUser = () => {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { register, handleSubmit } = useForm({});

  const Input = ({ children, ...props }) => <TextField
    {...props}
    {...register(props.name)}
    fullWidth
    variant="outlined"
  >{children}</TextField>;

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});

  const [DBList, setDBList] = useState([]);
  const [selectedDBs, setSelectedDBs] = useState([]);

  const [filterDBs, setFilter] = useState();

  const filterDBsList = useMemo(() => {
    const filterList = [...selectedDBs
      .filter(({ db }) => !DBList.includes(db)).map((el) => el.db), ...DBList];
    return filterDBs
      ? filterList.filter((name) => name.toLowerCase().indexOf(filterDBs.toLowerCase()) !== -1)
      : filterDBs;
  }, [DBList, filterDBs]);

  const fetchData = async () => {
    const { data: result } = await axios.post('/mongodb/databases');
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    const { databases } = result;
    setDBList(databases);
  };

  useEffect(() => {
    if (!DBList.length) fetchData();
  }, []);

  const checkData = (data) => {
    const errors = {};
    setFormErrors(errors);

    if (!data.title) errors.title = 'Name is required';
    if (!data.username) errors.username = 'Username is required';
    if (!data.password) errors.password = 'Password name is required';

    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setFormData({
      title: data.title,
      description: data.description,
      user: data.username,
      password: data.password,
      roles: selectedDBs || [],
    });
    handleOpen();
  };

  const onSubmit = async () => {
    const { data: result } = await axios.post('/mongodb/createUser', formData);
    if (!result.success) {
      console.error(result.error || result);
      handleClose();
      return;
    }

    router.back();
  };

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
      <form style={{ heigth: '100%' }}>
        <Grid container spacing={6} alignItems="flex-start" justifyContent='start'>
          <Grid container spacing={2} item md={6} sm={12}>
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignContent: 'center' }}>
              <Typography variant="h5">Info</Typography>
            </Grid>

            <Grid item xs={12}>
              <Input name="title" label="Name" error={formErrors.title}
                helperText={formErrors.title} />
            </Grid>
            <Grid item xs={12} >
              <Input name="description" label="Description"
                multiline rows={4} error={formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignContent: 'center' }}>
              <Typography variant="h5">Auth data</Typography>
            </Grid>

            <Grid item xs={12}>
              <Input name="username" label="Username" error={formErrors.username}
                helperText={formErrors.username} />
            </Grid>
            <Grid item xs={12} >
              <Input name="password" label="Password" error={formErrors.password}
                helperText={formErrors.password} />
            </Grid>
          </Grid>

          <Grid item md={6} sm={12}>
            <Typography variant="h5">Access data</Typography>
            <Divider sx={{ my: 2 }} />

            {!!DBList.length && <>
              <Typography variant="h6" sx={{ mt: 2 }}>Databases</Typography>
              <Paper sx={{
                m: 1,
                p: 2,
                // maxHeight: '350px',
                overflowY: 'auto',
              }}>
                <List >
                  <ListItem>
                    <TextField size="small" variant="outlined" fullWidth
                      label="Search" onChange={(e) => setFilter(e.target.value)} />
                  </ListItem>

                  {
                    (filterDBs && !filterDBsList.find((db) => db === filterDBs))
                    && <ListItem disablePadding key={filterDBs}>
                      <ListItemButton
                        onClick={() => {
                          setSelectedDBs([...selectedDBs, { db: filterDBs, role: accesses[0] }]);
                          setFilter('');
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" width='100%'>
                          <ListItemText primary={`${filterDBs} [ add ]`} />
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  }
                  {filterDBsList.map(((el) => (
                    <ListItem disablePadding key={el}>
                      <ListItemButton
                        selected={!!selectedDBs.find(({ db }) => db === el)}
                        onClick={(e) => {
                          if (e.target.nodeName === 'LI') return;

                          if (selectedDBs.find(({ db }) => db === el)) {
                            setSelectedDBs(selectedDBs.filter(({ db }) => db !== el));
                          } else {
                            setSelectedDBs([...selectedDBs, { db: el, role: accesses[0] }]);
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" width='100%'>
                          <ListItemText primary={el} />

                          {
                            selectedDBs.find(({ db }) => db === el)
                            && <Select
                              sx={{ width: '150px' }}
                              value={selectedDBs.find(({ db }) => db === el).role}
                              label="Access"
                              onChange={(e) => {
                                setSelectedDBs(selectedDBs.map((db) => {
                                  if (db.db === el) return { db: db.db, role: e.target.value };
                                  return db;
                                }));
                              }}
                            >
                              {accesses.map(
                                (access) => <MenuItem
                                  key={access}
                                  value={access}
                                >{access}</MenuItem>,
                              )}
                            </Select>
                          }
                        </Stack>
                      </ListItemButton>
                    </ListItem>
                  )))}
                </List>
              </Paper>
            </>}
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
    </Box>

    <Modal
      open={open}
      onClose={handleClose}
      onCancel={handleClose}
      onSubmit={onSubmit}
    >Confirm creation?</Modal>
  </>;
};

export default AddDBUser;
