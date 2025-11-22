import { Grid } from "@mui/joy";
import { Typography } from "@mui/material";
import RoundIconCard from "components/Card/RoundIconCard";
import { useFirebase } from "context/firebaseContext";
import { collection, collectionGroup, getCountFromServer, query, where } from "firebase/firestore";
import { Clock, Forbidden2, TickCircle } from "iconsax-react";
import { useEffect, useState } from "react";

function OverViewTab() {

  const todaysDate = new Date().toLocaleString();
  const [totalStudents, setTotalStudents] = useState(0);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalPresent: 0,
    totalAbsent: 0,
    totalOnLeave: 0,
  });

  const { db } = useFirebase()

  useEffect(() => {
    //students count from firestore STUDENTS collection
    const fetchStudentCount = async () => {
      try {
        const studentsRef = collection(db, "STUDENTS");
        const q = query(studentsRef);
        const snapshot = await getCountFromServer(q);
        setTotalStudents(snapshot.data().count);
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };

    const fetchAttendanceSummary = async () => {
      try {
        const attendanceRef = collectionGroup(db, "MY_ATTENDANCE");
        const today = new Date().toISOString().split("T")[0];
        const q = query(
          attendanceRef,
          where("date", "==", today),

        );
        const snapshot = await getCountFromServer(q);
        const totalPresent = snapshot.data().count;
        setAttendanceSummary((prev) => ({
          ...prev,
          totalPresent: totalPresent,
        }));
      } catch (error) {
        console.error("Error fetching attendance summary:", error);
      }
    }

    fetchStudentCount();
    fetchAttendanceSummary();

  }, [])


  return (
    <>
      <Typography>Today's Report</Typography>
      <Grid container spacing={2} mt={1}>
        <Grid xs={12} md={4}>

          <RoundIconCard
            iconPrimary={TickCircle}
            primary="Total Present"
            secondary={"" + attendanceSummary.totalPresent}
            content={todaysDate}
            color="#1b5e20"
            bgcolor="#c8e6c9"
          />

        </Grid>
        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Clock}
            primary="Total Absent"
            secondary={"" + (totalStudents - attendanceSummary.totalPresent)}
            content={todaysDate}
            color="#b71c1c"
            bgcolor="#ffcdd2"
          />
        </Grid>
        <Grid xs={12} md={4}>
          <RoundIconCard
            iconPrimary={Forbidden2}
            primary="Total On Leave"
            secondary={"" + attendanceSummary.totalOnLeave}
            content={todaysDate}
            color="#01579b"
            bgcolor="#b3e5fc"
          />
        </Grid>
      </Grid>
    </>
  );
}

export default OverViewTab;
