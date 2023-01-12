import { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import LoginLayout from '../components/LoginLayout';
import { TextField, Button, Box } from '@mui/material';
import styled from '@emotion/styled'
import axios from 'axios';

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState(null);
  const { register, handleSubmit, formState } = useForm({});

  const From = styled.form`
    display: flex;
    gap: 1em;
    align-items: start;
  `

  const onSubmit = async ({ token }) => {
    if (!token) return setError('Token is required')
    
    setError(null)

    const { data: result } = await axios.post('/api/auth/login', { token })
    if (result?.success) return router.push('/');

    return setError(result?.error || 'Unknown error')
  }

  return <LoginLayout>
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <From onSubmit={handleSubmit(onSubmit)}>
        <TextField
          required
          label="Token"
          name='token'
          type='text'
          variant="standard"
          {...register('token')}

          error={!!error}
          helperText={error}
        ></TextField>

        <Button
          disabled={formState.isSubmitting}
          type="submit"
          variant="outlined"

          sx={{ mt: '1em' }}
        >
          Login
        </Button>
      </From>
    </Box>
  </LoginLayout>
}

export default Login