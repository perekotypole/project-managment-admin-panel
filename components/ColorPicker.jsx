import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Paper, Box } from "@mui/material";

const ColorPicker = ({ color, setColor }) => {
  const [open, setOpen] = useState(false);

  return <Box
    sx={{
      position: 'relative',
      width: '100%', height: '100%'
    }}
    onFocus={() => { setOpen(true) }}
    onBlur={() => { setOpen(false) }}
  >
    <HexColorInput color={color} onChange={setColor} prefixed style={{
      height: '100%',
      width: '100%',
      fontSize: 'inherit',
      border: '1px solid #bbbbbb',
      borderRadius: '4px',
      padding: '1em',
    }} />

    <Paper elevation={20}
      sx={{
        position: 'absolute',
        zIndex: 999,
        right: 0,
        marginTop: '2px',
        display: open ? 'block' : 'none',
      }}
    >
      <HexColorPicker
        color={color}
        onChange={setColor}
      />
    </Paper>
  </Box>
}

export default ColorPicker