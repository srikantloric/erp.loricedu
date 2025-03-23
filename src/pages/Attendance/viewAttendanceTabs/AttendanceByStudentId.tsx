import {
  Grid,
  Stack,
  Input,
  Button,
  Typography,
  Box,
  LinearProgress,
} from "@mui/joy";
import { Paper } from "@mui/material";
import FullAttendanceReport from "components/AttendanceReport/FullAttendanceSelected";
import AttendanceCalendar from "components/Calendar/AttendanceCalendar";

import { SyntheticEvent, useEffect, useState } from "react";
import { StudentDetailsType } from "types/student";
import { enqueueSnackbar } from "notistack";
import { StudentAttendanceGlobalSchema } from "types/attendance";
import { Print } from "@mui/icons-material";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

function AttendanceByStudentId() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [filterdata, setfilterdata] = useState<StudentDetailsType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  ///attendance state
  const [presentDates, setPresentDates] = useState<string[]>([]);
  const [absentDates, setAbsentDates] = useState<string[]>([]);
  const [halfDayDates, setHalfDayDates] = useState<string[]>([]);
  const [notMarkedDates, setNotMarkedDates] = useState([]);
  const [futureDates, setFutureDates] = useState([]);
  const [totalPresents, setTotalpresent] = useState<number | null>();
  const [totalAbsents, setTotalAbsents] = useState<number | null>();
  const [totalHalf, settotalHalf] = useState<number | null>();
  const [fetchdone, setFetchdone] = useState<boolean>(false);

  const [attendanceData, setAttendanceData] = useState<
    StudentAttendanceGlobalSchema[]
  >([]);

  //Get Firebase DB instance
  const { db } = useFirebase();

  useEffect(() => {
    setAttendanceData([]);
    setFutureDates([]);
    setNotMarkedDates([])
    setFetchdone(false)
  }, [searchInput]);

  const handleSearch = async (e: SyntheticEvent) => {
    e.preventDefault();

    if (!searchInput) {
      setLoading(false);
      enqueueSnackbar("Please enter Student Id", { variant: "error" });
      return;
    }

    setLoading(true);

    try {
      const studentQuery = query(
        collection(db, "STUDENTS"),
        where("admission_no", "==", searchInput)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        setLoading(false);
        enqueueSnackbar("No student with this student ID!", { variant: "info" });
        return;
      }

      const studentList: StudentDetailsType[] = studentSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as StudentDetailsType[];

      setfilterdata(studentList);

      const studentId = studentList[0].id;
      const attendanceRef = collection(doc(db, "STUDENTS", studentId), "ATTENDANCE");

      // Fetch all attendance statuses in parallel
      const statuses = ["P", "H", "A"];
      const attendanceQueries = statuses.map((status) =>
        getDocs(query(attendanceRef, where("attendanceStatus", "==", status)))
      );

      const [presentSnapshot, halfDaySnapshot, absentSnapshot] = await Promise.all(attendanceQueries);

      // Process attendance records
      const extractAttendanceDates = (snapshot: any) =>
        snapshot.docs.map((doc: any) => doc.data().attendanceDate);

      const presentDates = extractAttendanceDates(presentSnapshot);
      const halfDayDates = extractAttendanceDates(halfDaySnapshot);
      const absentDates = extractAttendanceDates(absentSnapshot);

      // Update state
      setTotalpresent(presentDates.length);
      setPresentDates(presentDates);

      settotalHalf(halfDayDates.length);
      setHalfDayDates(halfDayDates);

      setTotalAbsents(absentDates.length);
      setAbsentDates(absentDates);

      setLoading(false);
      setFetchdone(true);
    } catch (error) {
      enqueueSnackbar("Invalid Student Id!", { variant: "error" });
      setLoading(false);
    }
  };

  const handlePrintAttendance = async () => {
    const pdfRes4 = await FullAttendanceReport(filterdata, attendanceData);
    const window4 =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    window.open(pdfRes4, "_blank", window4);
  };

  return (
    <Grid container spacing={2} marginTop={2}>
      <Paper
        sx={{
          padding: "8px",
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Stack
          direction={"row"}
          spacing={2}
          marginBottom={1.5}
          marginTop={1}
          marginLeft={0.5}
          marginRight={0.5}
          justifyContent="space-between"
        >
          <Stack direction="row" gap="8px">
            <Input
              placeholder="Student ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button sx={{ height: 20 }} onClick={(e) => handleSearch(e)} disabled={fetchdone}>
              Search
            </Button>
          </Stack>

          <Button
            sx={{ height: 20, marginLeft: "30px" }}
            type="submit"
            onClick={handlePrintAttendance}
            startDecorator={<Print />}
            color="success"
          ></Button>
        </Stack>
        {loading ? <LinearProgress /> : null}

        {filterdata &&
          filterdata.map((student, i) => {
            return (
              <>
                <br />
                <Paper sx={{ backgroundColor: "#FBFCFE", display: "flex" }}>
                  <div style={{ margin: "10px" }}>
                    <img
                      src={student.profil_url}
                      width={100}
                      height="100%"
                      style={{ objectFit: "cover" }}
                      alt="student"
                    ></img>
                  </div>
                  <div
                    style={{
                      margin: "8px 10px 8px 0px",
                      width: "50%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div>
                      <Typography
                        level="h4"
                        sx={{ fontWeight: "500" }}
                        textTransform="uppercase"
                      >
                        {student.student_name}
                      </Typography>
                      <Typography level="body-sm">
                        Father's Name : {student.father_name}
                      </Typography>
                      <Typography level="body-sm">
                        Student's ID: {student.admission_no}
                      </Typography>
                    </div>
                    <div
                      style={{
                        backgroundColor: "#F0F4F8",
                        display: "flex",
                        borderRadius: "8px",
                        gap: "20px",
                        marginTop: "10px",
                        padding: "10px 16px",
                        width: "fit-content",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography level="body-sm">Class</Typography>
                        <Typography level="title-sm">
                          {student.class}
                          {/* {location.state[0].class} */}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography level="body-sm">Roll</Typography>
                        <Typography level="title-sm">
                          {student.class_roll}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <Typography level="body-sm">Admission Date</Typography>
                        <Typography level="title-sm">
                          {student.admission_no}
                        </Typography>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      ></div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      ></div>
                    </div>
                  </div>
                  <Box
                    sx={{
                      display: "flex",
                      border: "1px solid var(--bs-gray-400)",
                      margin: "14px",
                      flex: 1,
                      borderRadius: "8px",
                      padding: "10px",
                      alignItems: "center",
                      justifyContent: "space-evenly",
                    }}
                  >
                    <Stack direction="column" alignItems="center">
                      <Typography level="h4" mt={1}>
                        {totalPresents}
                      </Typography>
                      <Typography level="body-sm">Total Present</Typography>
                    </Stack>

                    <Stack direction="column" alignItems="center">
                      <Typography level="h4" mt={1}>
                        {totalAbsents}
                      </Typography>
                      <Typography level="body-sm">Total Absents</Typography>
                    </Stack>

                    <Stack direction="column" alignItems="center">
                      <Typography level="h4" mt={1}>
                        5
                      </Typography>
                      <Typography level="body-sm">Total Holiday</Typography>
                    </Stack>
                    <Stack direction="column" alignItems="center">
                      <Typography level="h4" mt={1}>
                        {totalHalf}
                      </Typography>
                      <Typography level="body-sm">Half Day</Typography>
                    </Stack>
                  </Box>
                </Paper>

                <AttendanceCalendar
                  presentDates={presentDates}
                  absentDates={absentDates}
                  halfDayDates={halfDayDates}
                  notMarkedDates={notMarkedDates}
                  futureDates={futureDates}
                />
              </>
            );
          })}
      </Paper>
    </Grid>
  );
}

export default AttendanceByStudentId;
