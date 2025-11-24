import { Grid, Sheet } from "@mui/joy";
import { Box, Typography, CircularProgress } from "@mui/material";
import RoundIconCard from "components/Card/RoundIconCard";
import AttendanceBarChart from "components/Graph/AttendanceBarChart";
import { Clock, Forbidden2, TickCircle } from "iconsax-react";
import { useEffect, useState } from "react";
import { getAttendanceSummary, getClassWiseAttendanceSummary } from "services/firestore.attendance";
import { AttendanceSummary, ClassAttendanceSummary } from "types/AttendanceType";

function OverViewTab() {
  const todaysDate = new Date().toLocaleString();
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary>();
  const [attendanceSummaryClassWise, setAttendanceSummaryClassWise] = useState<ClassAttendanceSummary[]>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const d = new Date();
      const localDate = d.toISOString().split("T")[0]; // yyyy-mm-dd

      const summary = await getAttendanceSummary(localDate);
      const classSummary = await getClassWiseAttendanceSummary(localDate);

      setAttendanceSummary(summary);
      setAttendanceSummaryClassWise(classSummary);

      setLoading(false);
    };

    init();
  }, []);

  // 🔵 Show loader while data is fetching
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <>
      <Typography>Today's Report</Typography>

      <Grid container spacing={2} mt={1}>
        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={TickCircle}
            primary="Total Present"
            secondary={"" + attendanceSummary?.totalPresent}
            content={todaysDate}
            color="#1b5e20"
            bgcolor="#c8e6c9"
          />
        </Grid>

        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Clock}
            primary="Total Absent"
            secondary={"" + attendanceSummary?.totalAbsent}
            content={todaysDate}
            color="#b71c1c"
            bgcolor="#ffcdd2"
          />
        </Grid>

        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Forbidden2}
            primary="Total On Leave"
            secondary={"" + attendanceSummary?.totalOnLeave}
            content={todaysDate}
            color="#01579b"
            bgcolor="#b3e5fc"
          />
        </Grid>
      </Grid>

      <br />

      <Grid container gap="1rem">
        <Grid md={12} sm={12} xs={12}>
          <Sheet variant="outlined" sx={{ p: "1rem", borderRadius: "0.5rem" }}>
            <Box>
              <Typography textAlign="center" mb="0.5rem">
                Attendance Summary By Class - {new Date().toDateString()}
              </Typography>

              <AttendanceBarChart data={attendanceSummaryClassWise!} />
            </Box>
          </Sheet>
        </Grid>
      </Grid>
    </>
  );
}

export default OverViewTab;
