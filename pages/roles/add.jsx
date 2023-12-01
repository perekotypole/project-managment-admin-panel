import axios from '../../tools/axios';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Chip, Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper, TextField, Typography
} from '@mui/material';

import Modal from '../../components/Modal';
import Role from '../../components/Role';
import ColorPicker from '../../components/ColorPicker';

const AddRole = () => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const { register, handleSubmit } = useForm({});

  const Input = ({ children, ...props }) => <TextField
    {...props}
    {...register(props.name)}
    fullWidth
    variant="outlined"
  >{children}</TextField>

  const [formData, setFormData] = useState({})
  const [roleName, setRoleName] = useState('');
  const [color, setColor] = useState("#000000");
  const [formErrors, setFormErrors] = useState({})

  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [pagesList, setPagesList] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [blocksList, setBlocksList] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState([]);

  const [filterProjects, setFilter] = useState();

  const filterProjectsList = useMemo(() => filterProjects
    ? projectsList.filter(({ name }) =>
      name.toLowerCase().indexOf(filterProjects.toLowerCase()) !== -1)
    : projectsList
  , [projectsList, filterProjects])

  const fetchData = async () => {
    const { data: result } = await axios.post('/roles/getAllContent')
    if (!result.success) return console.error(result.error || result);

    const { projects, blocks, pages } = result
    setProjectsList(projects)
    setPagesList(pages)
    setBlocksList(blocks)
  }

  useEffect(() => {
    if (!projectsList.length
      || !pagesList.length
      || !blocksList.length
    ) fetchData()
  }, []);

  const checkData = (data) => {
    const errors = {}
    setFormErrors(errors)

    data.name = roleName
    data.color = color

    if (!data.name) errors.name = 'Role name is required'

    if (Object.keys(errors).length){
      setFormErrors(errors)
      return
    }

    setFormData({
      name: data.name,
      color: data.color,
      description: data.description,
      blocks: selectedBlocks,
      content: selectedPages,
      access: selectedProjects,
    })
    handleOpen()
  }
  
  const onSubmit = async () => {
    const { data: result } = await axios.post('/roles/create', formData)
    if (!result.success) {
      console.error(result.error || result);
      return handleClose()
    }

    router.back()
  }

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
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, alignContent: "center" }}>
              <Typography variant="h5">Main info</Typography>
              {!!roleName && <Role color={color}>{roleName}</Role>}
            </Grid>

            <Grid item xs={8}>
              <TextField
                name="roleName"
                label="Project name"
                fullWidth
                value={roleName}
                onChange={(e) => { setRoleName(e.target.value) }}
                error={formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            <Grid item xs={4}>
              <ColorPicker color={color} setColor={setColor}></ColorPicker>
            </Grid>
            <Grid item xs={12} >
              <Input name="description" label="Description"
                multiline rows={4}
              />
            </Grid>
          </Grid>

          <Grid item md={6} sm={12}>
            <Typography variant="h5">Access</Typography>
            <Divider sx={{ my: 2 }} />

            {!!blocksList.length && <>
              <Typography variant="h6" sx={{ mt: 2 }}>Dashboard Blocks</Typography>
              <Paper sx={{
                m: 1, p: 2,
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {blocksList.map((el => (
                    <Chip
                      key={el._id}
                      label={el.title}
                      color={'primary'}
                      variant={selectedBlocks.includes(el._id) ? "filled" : "outlined"}
                      onClick={() => {
                        if (selectedBlocks.includes(el._id)) {
                          setSelectedBlocks(selectedBlocks.filter(id => id !== el._id))
                        } else {
                          setSelectedBlocks([...selectedBlocks, el._id])
                        }
                      }}
                    />
                  )))}
                </Box>
              </Paper>
            </>}

            {!!pagesList.length && <>
              <Typography variant="h6" sx={{ mt: 2 }}>Default Pages</Typography>
              <Paper sx={{
                m: 1, p: 2,
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {pagesList.map((el => (
                    <Chip
                      key={el._id}
                      label={el.title}
                      color={'primary'}
                      variant={selectedPages.includes(el._id) ? "filled" : "outlined"}
                      onClick={() => {
                        if (selectedPages.includes(el._id)) {
                          setSelectedPages(selectedPages.filter(id => id !== el._id))
                        } else {
                          setSelectedPages([...selectedPages, el._id])
                        }
                      }}
                    />
                  )))}
                </Box>
              </Paper>
            </>}

            {!!projectsList.length && <>
              <Typography variant="h6" sx={{ mt: 2 }}>Projects</Typography>
              <Paper sx={{
                m: 1, p: 2,
                maxHeight: '350px',
                overflowY: 'auto'
              }}>
                <List >
                  <ListItem>
                    <TextField size="small" variant="outlined" fullWidth
                      label="Search" onChange={(e) => setFilter(e.target.value)} />
                  </ListItem>

                  {filterProjectsList.map((el => (
                    <ListItem disablePadding key={el._id}>
                      <ListItemButton
                        selected={selectedProjects.includes(el._id)}
                        onClick={() => {
                          if (selectedProjects.includes(el._id)) {
                            setSelectedProjects(selectedProjects.filter(id => id !== el._id))
                          } else {
                            setSelectedProjects([...selectedProjects, el._id])
                          }
                        }}
                      >
                        <ListItemText primary={el.name} />
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
        <Button onClick={handleSubmit(checkData)}><SaveIcon/></Button>
      </Box>
    </Box>

    <Modal
      open={open}
      onClose={handleClose}
      onCancel={handleClose}
      onSubmit={onSubmit}
    >Confirm creation?</Modal>
  </>
}

export default AddRole