import { Box } from '@mui/material';
import Header from './Header';

const Layout = ({ children, noheader = false }) => {
  return <Box
    sx={{
      height: '100vh',
      p: '2vw 5vw',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      gap: '3vh'
    }}
  >
    <Header onlyLogout={noheader}></Header>

    <Box
      id="root"
      sx={{ overflow: 'hidden' }}
    >
      <Box sx={{
        height: "100%",
        overflow: 'auto',
      }}>
        {children}
      </Box>
    </Box>

    <Box
      sx={{
        display: 'flex',
        justifyContent: {
          xs: 'center',
          sm: 'flex-end'
        }
      }}
    >
      Copyrights ©{ new Date().getFullYear() }. QTEAM
    </Box>
  </Box>
}

export default Layout