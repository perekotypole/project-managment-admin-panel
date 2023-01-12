import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Box,
  IconButton,
  Button,
  Collapse,
  Paper,
  Stack,
  Typography,
  TextField,
} from '@mui/material';
import {
  WebAsset as WebAssetIcon,
  SmartToy as SmartToyIcon,
  AddCircle,
  Edit,
  Delete,
  Replay,
  ContentCopy,
} from '@mui/icons-material';

const columns = [
  { id: 'status', align: 'center', style: { px: 0, width: '10px' } },
  { id: 'link', style: { px: 0, width: 0 } },
  { id: 'name', label: 'Name', style: { minWidth: 170, fontWeight: 700 } },
  { id: 'description', label: 'Description', style: { maxWidth: 350 },
    format: (value) => value ? value.length > 100 ? `${value.substr(0, 100)}...` : value : '',
  },
  { id: 'date', label: 'Last check time', style: { whiteSpace: 'nowrap' },
    format: (value) => value ? new Date(value)?.toLocaleString('uk-UA') : '',
  },
  { id: 'errors', label: 'Errors', align: 'right' },
  { id: 'events', style: { width: 0 } },
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

const Row = ({ row, columns, onRemove = () => {} }) => {
  const [open, setOpen] = useState(false);
  const { hiddenInfo = {} } = row

  return <>
    <TableRow hover key={row.code} onClick={() => { setOpen(!open) }}>
      {columns.map((column) => {
        const value = row[column.id];

        if (column.id === 'events') {
          return <TableCell key={column.id}>
            <Stack direction="row">
              <IconButton href={`/projects/${row.id}`}><Edit /></IconButton>
              <IconButton onClick={onRemove}><Delete /></IconButton>
            </Stack>
          </TableCell>
        }

        if (column.id === 'status') {
          return <TableCell key={column.id}
            sx={{
              maxWidth: column.width,
              p: 0,
              overflow: 'hidden',
              borderRadius: '1em',
              backgroundColor: value ? 'var(--color-green)' : 'var(--color-red)',
            }}
          />
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
    </TableRow>

    <TableRow>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={columns.length}>
        <Collapse in={open} timeout="auto" unmountOnExit>
          { row.description.length > 100 && 
            <Typography variant='body2'
              sx={{ p: '1em', display: 'block' }}
            >{row.description}</Typography>
          }

          <Paper sx={{ m: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Token</b></TableCell>
                  <TableCell><b>Reload time</b></TableCell>
                  <TableCell><b>Telegram</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow>
                  <TableCell>
                    {hiddenInfo.token}
                    <IconButton onClick={() => navigator.clipboard.writeText(hiddenInfo.token)}><ContentCopy/></IconButton>
                  </TableCell>
                  
                  <TableCell>{hiddenInfo.reloadTime}</TableCell>
                  
                  <TableCell>
                    <div><i>Token: </i>{hiddenInfo.telegram.token}</div>
                    <div><i>Chat: </i><a href={hiddenInfo.telegram.chat}>{hiddenInfo.telegram.chat}</a></div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  </>
}

const Projects = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [data, setData] = useState([]);

  const rows = useMemo(() => {
    return data.map(el => ({
      id: el._id,
      status: el.status,
      name: el.name,
      description: el.description,
      link: <ProjectLink link={el.link} type={el.type} />,
      date: el.checkDate,
      errors: el.errorsCount,
      hiddenInfo: {
        token: el.token,
        reloadTime: el.reloadTime,
        telegram: el.telegram,
      }
    }))
  }, [data])

  const fetchData = async () => {
    const { data: result } = await axios.post('/api/projects')
    if (!result.success) return

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

    await axios.post('/api/projects/remove', { id: elemOnRemove.id })
    fetchData()
    handleModalClose()
  }

  return <Layout>
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
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, i) => <Row
                key={`row-${i}`}
                row={row} columns={columns}
                onRemove={() => {removeProject(row)}}
              />)}
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
          count={rows.length}
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