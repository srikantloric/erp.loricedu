import { Grid } from "@mui/joy";
import { Typography } from "@mui/material";
import RoundIconCard from "components/Card/RoundIconCard";
import { Clock, Forbidden2, TickCircle } from "iconsax-react";

function OverViewTab() {
  return (
    <>
      <Typography>Today's Report</Typography>
      <Grid container spacing={2} mt={1}>
        <Grid xs={12} md={4}>
         
          <RoundIconCard
            iconPrimary={TickCircle}
            primary="Total Present"
            secondary="225"
            content="22nd April 2024"
            color="#1b5e20"
            bgcolor="#c8e6c9"
            />
            
        </Grid>
        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Clock}
            primary="Total Absent"
            secondary="25"
            content="22nd April 2024"
            color="#b71c1c"
            bgcolor="#ffcdd2"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Forbidden2}
            primary="Total On Leave"
            secondary="15"
            content="22nd April 2024"
            color="#01579b"
            bgcolor="#b3e5fc"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default OverViewTab;
