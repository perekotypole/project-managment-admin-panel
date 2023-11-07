import { Chip } from "@mui/material"
import { lighten } from "polished"

const Role = ({ children, color, sx={}}) => {
  const colorStyle = color ? {
    backgroundColor: lighten(.4, color),
    color: color,
  } : {}

  return <Chip label={children} sx={{
    fontWeight: '600',
    ...colorStyle,
    ...sx,
  }}/>
}

export default Role