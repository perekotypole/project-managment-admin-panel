import { Box } from '@mui/material';

const Iframe = ({ src }) => {
  return <Box
    sx={{
      width: '100%',
      height: '100%',
      borderRadius: 2,
      boxShadow: 3,
      overflow: 'hidden',
    }}
  >
    <iframe src={src} style={{
      width: '100%',
      height: '100%',
      border: 'none'
    }}></iframe>
  </Box>
}

export default Iframe