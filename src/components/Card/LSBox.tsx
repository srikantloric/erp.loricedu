import { Box, Stack, useTheme } from "@mui/material"

type LSBoxProps = {
  children: React.ReactNode
}

function LSBox({ children }: LSBoxProps) {
  const theme = useTheme()
  return (

    <Box boxShadow={1} overflow={"hidden"} width={"fit-content"} >
      <Box sx={{ bgcolor: theme.palette.primary.main, height: "3px" }} />
      <Stack flex={1} p={2} >
        {children}
      </Stack>
    </Box>
  )
}

export default LSBox