import { useEffect, useRef, useState } from "react";
import { Box, TextField } from "@material-ui/core";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { Paper } from "@mui/material";

const ColorPicker = ({ color, setColor }) => {
  const [open, setOpen] = useState(false);

  return <Box
    sx={{
      position: 'relative',
    }}
    onFocus={() => { setOpen(true) }}
    onBlur={() => { setOpen(false) }}
  >
    <TextField
      fullWidth
      value={color}
      onChange={(e) => { setColor(e.target.value) }}
    ></TextField>

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