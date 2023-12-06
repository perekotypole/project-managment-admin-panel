import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, FormControlLabel, IconButton, List, ListItem,
  ListItemButton, ListItemText, Paper, Stack,
  Table, TableBody, TableCell, TableContainer,
  TableHead, TablePagination, TableRow, TextField,
} from '@mui/material';
import { Delete, Replay } from '@mui/icons-material';
import axios from '../../tools/axios';

import { getAutoErrorRemoval, setAutoErrorRemoval } from '../../tools/functions';
import Modal from '../../components/Modal.jsx';

const columns = [
  { id: 'project', label: 'Project', style: { fontWeight: 700 } },
  { id: 'message', label: 'Error' },
  {
    id: 'date',
    label: 'Time',
    style: { whiteSpace: 'nowrap' },
    format: (value) => (value ? new Date(value)?.toLocaleString('uk-UA') : ''),
  },
  { id: 'events', style: { width: 0 } },
];

const ErrorsPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [errorsList, setErrorsList] = useState([]);

  const [filter, setFilter] = useState();
  const filterList = useMemo(
    () => (filter
      ? projectsList.filter(({ name }) => name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
      : projectsList),
    [projectsList, filter],
  );

  const rows = useMemo(() => errorsList.filter((el) => !selectedProject
      || (el.projectID?.id
        ? selectedProject === el.projectID?.id
        : selectedProject === 'others')).map((el) => ({
    id: el.id,
    project: el.projectID?.name,
    message: el.message,
    date: el.createdAt,
  })), [errorsList, selectedProject]);

  const fetchProjects = async () => {
    const { data: result } = await axios.post('/projects/shortList');
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    setProjectsList(result?.projectsList);
  };
  const fetchErrors = async () => {
    const { data: result } = await axios.post('/projects/errors');
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    setErrorsList(result?.errorsList);
  };
  useEffect(() => {
    if (!projectsList.length) fetchProjects();
    if (!errorsList.length) fetchErrors();
  }, []);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [open, setOpen] = useState(false);
  const [openType, setOpenType] = useState(false);
  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => {
    setOpen(false);
    setOpenType(null);
  };

  const [elemOnRemove, setElemOnRemove] = useState(null);
  const [remember, setRemember] = useState(null);

  useEffect(() => {
    if (!open) setElemOnRemove(null);
  }, [open]);

  const comfirmRemove = async (elem) => {
    const remove = elem || elemOnRemove;
    if (!remove) return;

    if (remember) setAutoErrorRemoval();

    const { data: result } = await axios.post('/projects/error/remove', { id: remove.id });
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    fetchErrors();
    handleModalClose();
  };

  const comfirmRemoveAll = async () => {
    let filterObj = {};

    if (selectedProject === 'others') filterObj = { others: true };
    else filterObj = { id: selectedProject };

    const { data: result } = await axios.post('/projects/error/removeAll', filterObj);
    if (!result.success) {
      console.error(result.error || result);
      return;
    }

    fetchErrors();
    handleModalClose();
  };

  const removeError = (elem) => {
    setElemOnRemove(elem);
    setRemember(false);

    if (getAutoErrorRemoval()) comfirmRemove(elem);
    else handleModalOpen();
  };

  const removeAllError = () => {
    setOpenType('all');
    handleModalOpen();
  };

  return <>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 3fr',
      '@media screen and (max-width: 780px)': {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '250px auto',
      },
      gap: 4,
      minHeight: '100%',
    }}>
      <Paper sx={{
        m: 1,
        p: 2,
        maxHeight: 'calc(100% - 16px)',
        overflowY: 'auto',
      }}>
        <List>
          <ListItem>
            <TextField size="small" variant="outlined" sx={{ mt: -2 }} fullWidth
              label="Search" onChange={(e) => setFilter(e.target.value)} />
          </ListItem>

          {filterList.map(((el) => (
            <ListItem disablePadding key={el.id}>
              <ListItemButton
                selected={selectedProject === el.id}
                onClick={() => setSelectedProject(selectedProject !== el.id ? el.id : null)}
              >
                <ListItemText primary={el.name} />
              </ListItemButton>
            </ListItem>
          )))}

          <ListItem disablePadding key={'others'}>
            <ListItemButton
              selected={selectedProject === 'others'}
              onClick={() => setSelectedProject(selectedProject !== 'others' ? 'others' : null)}
            >
              <ListItemText primary={'Others'} />
            </ListItemButton>
          </ListItem>
        </List>
      </Paper>

      <Box sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
      }}>
        <Button
          sx={{ justifySelf: 'end' }}
          startIcon={<Delete />}
          variant="contained"
          color="error"
          onClick={removeAllError}
        >Remove all{selectedProject ? ` from ${projectsList.find((el) => el.id === selectedProject)?.name || 'others'}` : ''}</Button>

        <TableContainer>
          <Table size="small" stickyHeader aria-label="sticky table" >
            <TableHead>
              <TableRow>
                {columns.map((column) => <TableCell
                  key={column.id}
                  align={column.align}
                  sx={{
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    ...column.style,
                  }}
                >
                  {column.label}
                </TableCell>)}
              </TableRow>
            </TableHead>

            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, i) => <TableRow
                  key={`row-${i}`}
                >
                  {columns.map((column) => {
                    if (column.id === 'events') {
                      return <TableCell key={column.id}>
                        <IconButton onClick={() => removeError(row)}><Delete /></IconButton>
                      </TableCell>;
                    }

                    return <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{ ...column.style }}
                    >
                      {column.format ? column.format(row[column.id]) : row[column.id]}
                    </TableCell>;
                  })}
                </TableRow>)}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" sx={{ justifyContent: 'end', alignItems: 'center' }} >
          <Button onClick={() => {
            setErrorsList([]);
            setPage(0);
            fetchErrors();
          }}><Replay /></Button>

          <TablePagination
            rowsPerPageOptions={[15, 25, 50, rows.length]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}

            sx={{
              height: 'fit-content',
            }}
          />
        </Stack>
      </Box>
    </Box>

    <Modal
      open={open}
      onClose={handleModalClose}
      onCancel={handleModalClose}
      onSubmit={() => {
        if (openType === 'all') comfirmRemoveAll();
        else comfirmRemove();
      }}
    >
      {openType === 'all'
        ? <>
        {
          selectedProject ? <div>Remove all{selectedProject ? ` from ${projectsList.find((el) => el.id === selectedProject)?.name || 'others'}` : ''}</div>
            : <div>Remove ALL errors</div>
        }
      </>
        : <>
        <div>Remove <b>{elemOnRemove?.project || `"${elemOnRemove?.message}"`}</b> error?</div>
        <FormControlLabel sx={{ mt: 1 }}
          label="Don`t ask for removal within 1 hour"
          control={<Checkbox checked={remember} onChange={() => setRemember(!remember)} />}
        />
      </>
      }

    </Modal>
  </>;
};

export default ErrorsPage;
