import { Paper, Typography } from '@mui/material'
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";


interface Props{
    Title:string
}

function HeaderTitleCard({Title}:Props) {
  return (
      <>
  
    <Paper
    sx={{
        padding: "8px",
        background: "var(--bs-primary)",
        color: "#fff",
        display: "flex",
        margin:"12px 0px",
        alignItems: "center",
    }}
    >
    <ArrowCircleRightIcon sx={{ mr: "5px" }} />
    <Typography sx={{ fontSize: "18px", color: "#fff" }}>
     {Title}
    </Typography>
  </Paper>
   
  </>
  )
}

export default HeaderTitleCard