import { Autorenew, Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, FormControl,
  Grid, IconButton, InputLabel,
  MenuItem, OutlinedInput, TextField, Typography
} from '@mui/material';

import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Layout from '../../components/Layout';
import Modal from '../../components/Modal';
import { generateToken } from '../../tools/functions';

const types = [
  {
    value: 'website',
    label: 'Website',
  },
  {
    value: 'telegramBot',
    label: 'Telegram bot',
  },
];

const EditProject = () => {
  const router = useRouter()
  const { id } = router.query

  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const { register, handleSubmit } = useForm({});

  const Input = ({ children, ...props }) => <TextField
    {...register(props.name)}
    {...props}
    fullWidth
    variant="outlined"
  >{children}</TextField>

  const [formData, setFormData] = useState({})
  const [token, setToken] = useState('')
  const [formErrors, setFormErrors] = useState({})

  const fetchData = async (id) => {
    const { data: result } = await axios.post('/api/projects/getOne', { id })
    if (!result.success) return handleClose()

    const { project: data } = result
    setFormData(data)
  }
  const checkData = (data) => {
    const errors = {}
    setFormErrors(errors)

    if (!data.name) errors.name = 'Project name is require'
    if (!data.type) errors.type = 'Type is require'
    if (!data.reloadTime) errors.reloadTime = 'Reload time is require'

    if (!data.token) data.token = token || generateToken()

    if (Object.keys(errors).length){
      setFormErrors(errors)
      return
    }

    setFormData({
      name: data.name,
      type: data.type,
      description: data.description,
      token: data.token,
      reloadTime: data.reloadTime,
      link: data.link,
      telegram: {
        chat: data.telegramChat,
        token: data.telegramToken
      }
    })
    handleOpen()
  }
  const onSubmit = async () => {
    const { data: result } = await axios.post('/api/projects/edit', { id, projectData: formData })
    if (!result.success) return handleClose()

    router.back()
  }

  useEffect(() => {
    if (!id) return
    fetchData(id)
  }, [id]);

  useEffect(() => {
    if (!Object.keys(formData).length) return
    console.log(formData);
    setLoading(false)
    setToken(formData.token)
  }, [formData]);

  return <Layout>
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
      { !loading &&
        <>
          <form style={{ heigth: '100%' }}>
            <Grid container spacing={6} alignItems="flex-start" justifyContent='start'>
              <Grid container spacing={2} item md={6} sm={12}>
                <Grid item xs={12}><Typography variant="h5">Main info</Typography></Grid>

                <Grid item xs={6}>
                  <Input name="name" label="Project name" defaultValue={formData.name} error={formErrors.name} helperText={formErrors.name}/>
                </Grid>
                <Grid item xs={6}>
                  <Input name="type" label="Type" select defaultValue={formData.type}
                    error={formErrors.type} helperText={formErrors.type}
                  >
                    {types.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Input>
                </Grid>
                <Grid item xs={12}>
                  <Input name="link" label="Link" defaultValue={formData.link}/>
                </Grid>
                <Grid item xs={12} >
                  <Input name="description" label="Description" defaultValue={formData.description}
                    multiline rows={4}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} item md={6} sm={12}>
                <Grid item xs={12}><Typography variant="h5">Additional tools</Typography></Grid>

                <Grid item xs={8}>
                  <FormControl fullWidth variant="outlined" >
                    <InputLabel>Token</InputLabel>
                    <OutlinedInput
                      name="token"
                      label="Token"
                      value={token}
                      onChange={(e) => { setToken(e.target.value) }}
                      endAdornment={
                        <IconButton edge="end" onClick={() => setToken(generateToken())}>
                          <Autorenew />
                        </IconButton>
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={4}>
                  <Input name='reloadTime' label="Reload time" type="number" defaultValue={formData.reloadTime}
                    error={formErrors.reloadTime} helperText={formErrors.reloadTime}
                  />
                </Grid>

                <Grid item xs={12}><Typography variant="p">Telegram</Typography></Grid>

                <Grid item xs={6}>
                  <Input name='telegramToken' label="Bot token" defaultValue={formData.telegram?.token} />
                </Grid>
                <Grid item xs={6}>
                  <Input name='telegramChat' label="Chat link" defaultValue={formData.telegram?.chat} />
                </Grid>
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
        </>
      }
    </Box>

    <Modal
      open={open}
      onClose={handleClose}
      onCancel={handleClose}
      onSubmit={onSubmit}
    >Confirm changes?</Modal>
  </Layout>
}

export default EditProject