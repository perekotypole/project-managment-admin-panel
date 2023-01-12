import { Cancel as CancelIcon, Save as SaveIcon } from '@mui/icons-material';
import { Box, Button, Modal as MuiModal, Stack } from '@mui/material';

const Modal = ({
  children,
  open = false,
  onClose = () => {},
  onSubmit = () => {},
  onCancel = () => {},
}) => {
  return <MuiModal
    open={open}
    onClose={onClose}
  >
    <Box sx={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '100%',
      maxWidth: 400,
      bgcolor: '#fff',
      borderRadius: 2,
      boxShadow: 10,
      p: 4,
    }}>
      {children}

      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
        <Button fullWidth variant="outlined" onClick={onCancel}><CancelIcon/></Button>
        <Button fullWidth variant="contained" onClick={async (e) => { await onSubmit(e) }}><SaveIcon/></Button>
      </Stack>
    </Box>
  </MuiModal>
}

export default Modal