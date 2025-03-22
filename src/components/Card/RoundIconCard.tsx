import {
  Avatar,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

// ============================|| ATTENDANCE - ROUND ICON CARD ||============================ //

interface Props {
  primary: string;
  secondary: string;
  content: string;
  iconPrimary: any;
  color: string;
  bgcolor: string;
}

function RoundIconCard({
  primary,
  secondary,
  content,
  iconPrimary,
  color,
  bgcolor,
}: Props) {
  const IconPrimary = iconPrimary!;

  return (
    <Card variant="outlined" sx={{ borderRadius: "16px", padding: "5px" }}>
      <CardContent>
        <Grid
          container
          alignItems="center"
          spacing={0}
          justifyContent="space-between"
        >
          <Grid item>
            <Stack spacing={0.5}>
              <Typography variant="h4" color="inherit" fontSize={"16px" }>
                {primary}
              </Typography>
              <Typography variant="h4" fontSize={"24px"} fontWeight={500}>{secondary}</Typography>
              <Typography variant="subtitle2" color="inherit" fontWeight={400}>
                {content}
              </Typography>
            </Stack>
          </Grid>
          <Grid item>
            <Avatar  sx={{ bgcolor,borderRadius:"12px",height:"50px", width:"50px",color}}  >
              <IconPrimary />
            </Avatar>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default RoundIconCard;
