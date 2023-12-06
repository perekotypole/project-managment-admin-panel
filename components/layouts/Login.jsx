import React from 'react';
import { Box } from '@mui/material';

const LoginLayout = ({ children }) => <Box
    sx={{
      height: '100%',
      minHeight: '100vh',
      p: '2vw 5vw',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: '1fr auto',
      gap: '3vh',
    }}
  >
    <main id="root">
      {children}
    </main>

    <Box
      sx={{
        display: 'flex',
        justifyContent: {
          xs: 'center',
          sm: 'flex-end',
        },
      }}
    >
      Copyrights ©{ new Date().getFullYear() }. QTEAM
    </Box>
  </Box>;

export default LoginLayout;
