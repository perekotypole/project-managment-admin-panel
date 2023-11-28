import axios from '../../tools/axios';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Box,
  IconButton,
  Button,
  Paper,
  Stack,
  Typography,
  TextField,
  Divider,
  Switch,
} from '@mui/material';
import {
  WebAsset as WebAssetIcon,
  SmartToy as SmartToyIcon,
  AddCircle,
  Edit,
  Delete,
  Replay,
} from '@mui/icons-material';
import CopyText from '../../components/CopyText';

const columns = [
  { id: 'status', align: 'center', style: { px: 0, width: '10px' } },
  { id: 'link', style: { px: 0, width: '5px' } },
  { id: 'name', label: 'Name', style: { fontWeight: 700 } },
  { id: 'date', label: 'Last check time', style: { whiteSpace: 'nowrap' },
    format: (value) => value ? new Date(value)?.toLocaleString('uk-UA') : ''},
  { id: 'errors', label: 'Errors', align: 'right' },
  { id: 'running', label: 'Running', align: 'right', style: { width: '50px' } },
];

const ProjectLink = ({ type, link }) => {
  if (!type || !link) return <></>

  const icon = type === 'website' ?
    <WebAssetIcon /> :
  type === 'telegramBot' ?
    <SmartToyIcon /> :
    null

  const formatLink = (str) => {
    const split = str.split('//')
    return split[split.length - 1].slice(0, 7) + '...'
  }

  if (!icon) return <Button
      href={link} target="_blank"
      sx={{ textTransform: 'lowercase' }}
    >{formatLink(link)}</Button>

  return <IconButton
    href={link}
    variant="outlined"
    target="_blank"
    color="primary"
  >{icon}</IconButton>
}

const Projects = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [data, setData] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState();

  const rows = useMemo(() => {
    return data.map(el => ({
      ...el,
      id: el._id,
      link: <ProjectLink link={el.link} type={el.type} />,
      date: el.checkDate,
      errors: el.errorsCount,
    }))
  }, [data])

  useEffect(() => {
    if (!selectedProject) return

    setProjectDetails(rows.find(el => el.id === selectedProject))
  }, [selectedProject]);

  const [filter, setFilter] = useState();
  const filterList = useMemo(() => filter
    ? rows.filter(({ name }) =>
      name.toLowerCase().indexOf(filter.toLowerCase()) !== -1)
    : rows
    , [rows, filter])

  const fetchData = async () => {
    const { data: result } = await axios.post('/projects')
    if (!result.success) return console.error(result.error || result);

    const { projectsList } = result
    setData(projectsList)
  }
  useEffect(() => { if (!data.length) fetchData() }, []);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const [open, setOpen] = useState(false)
  const handleModalOpen = () => setOpen(true)
  const handleModalClose = () => setOpen(false)

  const [elemOnRemove, setElemOnRemove] = useState(null)
  const [nameForRemoval, setNameForRemoval] = useState('')
  const [removalError, setRemovalError] = useState(null)

  useEffect(() => {
    if (!open) {
      setElemOnRemove(null)
      setNameForRemoval('')
      setRemovalError(null)
    }
  }, [open]);

  const removeProject = (elem) => {
    setElemOnRemove(elem)
    handleModalOpen()
  }

  const comfirmRemove = async () => {
    if (elemOnRemove.name !== nameForRemoval) {
      setRemovalError('Values don`t match')
      return
    }

    const { data: result } = await axios.post('/projects/remove', { id: elemOnRemove.id })
    if (!result.success) return console.error(result.error || result);

    fetchData()
    handleModalClose()
  }

  const runningStatusToggle = async (id) => {
    const { data: result } = await axios.post('/projects/switchRunningStatus', { id })
    if (!result.success) return console.error(result.error || result);

    fetchData()
  }

  return <Layout>
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      '@media screen and (max-width: 780px)': {
        gridTemplateColumns: '1fr',
        gridTemplateRows: '500px auto',
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
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateRows: '1fr auto'
        }}>

          <TableContainer>
            <Table stickyHeader aria-label="sticky table" >
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align}
                      sx={{
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        ...column.style,
                      }}
                    >
                      {column.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filterList
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, i) => <TableRow hover
                    key={`row-${i}`}
                    selected={selectedProject === row.id}
                    onClick={() => setSelectedProject(row.id)}
                  >
                    {columns.map((column) => {
                      const value = row[column.id];
              
                      if (column.id === 'status') {
                        return <TableCell key={column.id}
                          sx={{
                            maxWidth: column.width,
                            p: 0,
                            overflow: 'hidden',
                            borderRadius: '1em',
                            backgroundColor: !row?.stopped
                              ? value ? 'var(--color-green)' : 'var(--color-red)'
                              : 'grey',
                          }}
                        />
                      }
              
                      if (column.id === 'running') {
                        return <TableCell sx={{ padding: 0, textAlign: 'center' }}>
                          <Switch key={`running-${row.id}`} defaultChecked={!row?.stopped} onChange={() => runningStatusToggle(row.id)} />
                        </TableCell>
                      }
              
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ ...column.style }}
                        >
                          {column.format ? column.format(value) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>)}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" sx={{ justifyContent: 'end', alignItems: 'center' }} >
            <Button onClick={() => {
              setData([])
              setPage(0)
              fetchData()
            }}><Replay/></Button>

            <Button href="/projects/add"><AddCircle/></Button>

            <TablePagination
              rowsPerPageOptions={[10, 25, 50]}
              component="div"
              count={filterList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}

              sx={{
                height: 'fit-content'
              }}
            />
          </Stack>
        </Box>
      </Paper>

      <Box sx={{
        width: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: '1fr auto'
      }}>
        {projectDetails && <Box>
          <Stack direction='row' spacing={1} justifyContent='space-between'>
            <Stack direction='row' spacing={1} alignItems='center'>
                <Typography variant='h5'
                  color={projectDetails.status ? 'var(--color-green)' : 'var(--color-red)'}
                >{projectDetails.name}</Typography>

                {projectDetails.link}
            </Stack>

            <Stack direction="row">
              <IconButton href={`/projects/${projectDetails.id}`}><Edit /></IconButton>
              <IconButton onClick={() => removeProject(projectDetails)}><Delete /></IconButton>
            </Stack>
          </Stack>

          { projectDetails.description && <>
            <Typography variant='body2'><i>Description</i>: {projectDetails.description}</Typography>
          </>}
          <Typography variant='body2'><i>Created</i>: {new Date(projectDetails.createdAt).toLocaleString('uk-UA')}</Typography>
          <Typography variant='body2'><i>Type</i>: {projectDetails.type}</Typography>
          
          <Divider sx={{ my: 2 }} />

          <Typography variant='subtitle1'><b>Token</b>: <CopyText>{projectDetails.token}</CopyText></Typography>
          <Typography variant='subtitle1'><b>Reload time</b>: {projectDetails.reloadTime}s</Typography>
          <Typography variant='subtitle1'><b>Last check</b>: {projectDetails.date ? new Date(projectDetails.date)?.toLocaleString('uk-UA') : 'No check'}</Typography>
          <Typography variant='subtitle1'><b>Errors</b>: {projectDetails.errors}</Typography>
          
          { projectDetails.requestLink && <>
            <Typography variant='subtitle1'><b>Request link</b>: <CopyText>{projectDetails.requestLink}</CopyText></Typography>
          </>}


          { (projectDetails.telegram?.token || projectDetails.telegram?.chat) && <>
            <Divider sx={{ my: 1 }} />

            <Typography variant='subtitle1'><b>Telegram</b></Typography>
            <Typography variant='subtitle2'><b>Token:</b> <CopyText hideText={'***'}>{projectDetails.telegram?.token}</CopyText></Typography>
            <Typography variant='subtitle2'><b>Chat:</b> <CopyText>{projectDetails.telegram?.chat}</CopyText></Typography>
          </>}
        </Box>}
      </Box>
    </Box>

    <Modal
      open={open}
      onClose={handleModalClose}
      onCancel={handleModalClose}
      onSubmit={comfirmRemove}
    >
      <div>Enter <b>{elemOnRemove?.name}</b> for comfirm removal?</div>

      <TextField
        fullWidth
        error={!!removalError}
        helperText={removalError}
        onChange={(e) => {
          setNameForRemoval(e.target.value)
          if (removalError) setRemovalError(null)
        }}
        value={nameForRemoval}
        label="Project name"
        variant="standard"
      />
    </Modal>
  </Layout>
}

export default Projects