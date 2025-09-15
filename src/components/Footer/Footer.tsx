import { Stack, Typography } from "@mui/material"
import { memo } from "react"

const Footer = memo(function Footer() {
  return (
    <Stack justifyContent={"center"} alignItems={"center"}>
      <Typography variant="caption" color={"GrayText"}>
        © Copyright 2025. Loric Edu, All rights reserved. | Loric Softwares |RN - UDYAM-JH-08-0038269
      </Typography>
    </Stack>
  )
})

export default Footer