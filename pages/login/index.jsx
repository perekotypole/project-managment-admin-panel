import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';

import { TextField, Button, Box } from '@mui/material';
import md5 from 'md5';
import axios from '../../tools/axios';

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState({});
  const { register, handleSubmit, formState } = useForm({});

  const onSubmit = async ({ login, password }) => {
    if (!login || !password) {
      return setError({
        login: !login ? 'Login is required' : null,
        password: !password ? 'Password is required' : null,
      });
    }

    setError({});

    const { data: result } = await axios.post('/auth/login', { login, password: md5(password) });
    if (result?.success) return router.reload();

    return setError(result?.error || { global: 'Unknown error' });
  };

  return <Box
    sx={{
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <form onSubmit={handleSubmit(onSubmit)}
      style={{
        display: 'flex',
        gap: '1em',
        flexDirection: 'column',
        width: '95%',
        maxWidth: '350px',
      }}
    >
      <span style={{ color: 'var(--color-red)' }}>{error.global}</span>

      <TextField
        required fullWidth
        label="Login"
        name='login'
        type='text'
        variant="standard"
        {...register('login')}

        error={!!error.login}
        helperText={error.login}
      ></TextField>

      <TextField
        required fullWidth
        label="Password"
        name='password'
        type='password'
        variant="standard"
        {...register('password')}

        error={!!error.password}
        helperText={error.password}
      ></TextField>

      <Button
        fullWidth
        disabled={formState.isSubmitting}
        type="submit"
        variant="outlined"

        sx={{ mt: '1em' }}
      >
        Login
      </Button>
    </form>
  </Box>;
};

export default Login;
