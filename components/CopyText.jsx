import { Box, Button, ClickAwayListener, Tooltip, Zoom } from '@mui/material';
import { useState } from 'react';

const CopyText = ({ children }) => {
  const [open, setOpen] = useState(false);
  const handleTooltipClose = () => setOpen(false)
  const handleTooltipOpen = () => {
    navigator.clipboard.writeText(children)
    setOpen(true)

    setTimeout(handleTooltipClose, 1000);
  }

  return <ClickAwayListener onClickAway={handleTooltipClose}>
    <Tooltip
        PopperProps={{ disablePortal: true }}
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        TransitionComponent={Zoom}
        arrow
        title="Copied"
        placement='top'
      >
        <Button display={'inline'}
          onClick={handleTooltipOpen}
          sx={{
            p: '0 .5em .1em .5em',
            m: '.1em',
            color: '#000',
            textTransform: 'none',
            backgroundColor: "#dae3f1",
            borderRadius: '.5em',
            transition: 'all .5s',
            '&:hover': {
              backgroundColor: "#c0ccdf",
            }
          }}
        >
          {children}
        </Button>
      </Tooltip>
  </ClickAwayListener>
}

export default CopyText