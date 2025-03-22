import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  LinearProgress,
  Option,
  Select,
  Table,
  Typography,
} from "@mui/joy";
import { Paper } from "@mui/material";
import { db } from "../../../firebase";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { StudentAttendanceGlobalSchema } from "types/attendance";
import {
  getAttendanceStatusByCode,
  getCurrentDate,
  makeDoubleDigit,
} from "utilities/UtilitiesFunctions";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { Print } from "@mui/icons-material";
import { AttendanceReportGenerator } from "components/AttendanceReport/AttendanceReportGenerator";
import { doc, getDoc } from "firebase/firestore";

type AttendanceHeaderDataType = {
  totalStudent: number;
  totalAbsent: number;
  totalPresent: number;
  totalLeave: number;
  totalHoliday: number;
};

function AttendanceByClass() {
  ///Form Input State
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [attendanceHeaderData, setAttendanceHeaderData] =
    useState<AttendanceHeaderDataType | null>(null);

  const [individualAttendanceData, setIndividualAttendanceData] = useState<
    StudentAttendanceGlobalSchema[]
  >([]);

  const fetchStudentAtt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedClass) {
      enqueueSnackbar("Please select a class!", { variant: "error" });
      return;
    }

    setLoading(true);
    const classDate = `${makeDoubleDigit(selectedClass.toString())}_${selectedDate}`;

    setIndividualAttendanceData([]);
    setAttendanceHeaderData(null);

    try {
      const attendanceRef = doc(db, "ATTENDANCE", classDate);
      const snapshot = await getDoc(attendanceRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as any;
        const total_student = data.total_student;

        const headerData: AttendanceHeaderDataType = {
          totalStudent: data.total_student,
          totalAbsent: data.total_absent,
          totalLeave: data.total_leave,
          totalPresent: data.total_present,
          totalHoliday: data.total_holiday,
        };
        setAttendanceHeaderData(headerData);

        const attendanceDataTempArr: StudentAttendanceGlobalSchema[] = Array.from(
          { length: total_student },
          (_, i) => ({
            studentName: data[`student_${i}_name`],
            studentId: data[`student_${i}_id`],
            studentFatherName: data[`student_${i}_father`],
            studentProfile: data[`student_${i}_profile`],
            studentRegId: data[`student_${i}_regId`],
            studentContact: data[`student_${i}_contact`],
            attendanceStatus: data[`student_${i}_status`],
            isSmartAttendance: false,
            createdAt: data[`student_${i}_timestamp`]?.toDate()?.toLocaleString(),
            comment: data[`student_${i}_comment`],
          })
        );

        setIndividualAttendanceData(attendanceDataTempArr);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      enqueueSnackbar("Failed to fetch attendance!", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleNewWindowOpen = async () => {
    const attendanceHeaderDataa = attendanceHeaderData!;
    const pdfRes = await AttendanceReportGenerator(
      attendanceHeaderDataa,
      individualAttendanceData
    );
    const features =
      "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    window.open(pdfRes, "_blank", features);
  };
  return (
    <Paper sx={{ p: 2, border: "1px solid var(--bs-gray-300)" }}>
      <Box
        component="form"
        onSubmit={fetchStudentAtt}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <FormControl>
            <FormLabel>Select Date</FormLabel>
            <Input
              required
              placeholder="Placeholder"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Class</FormLabel>
            <Select
              required
              placeholder="Class"
              defaultValue={null}
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
              sx={{ minWidth: 200 }}
            >
              {SCHOOL_CLASSES.map((item, i) => {
                return (
                  <Option value={item.value} key={item.id}>
                    {item.title}{" "}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button sx={{ height: 20 }} type="submit">
            Fetch
          </Button>
          {individualAttendanceData.length > 0 ? (
            <Button
              sx={{ height: 20 }}
              endDecorator={<Print />}
              color="primary"
              onClick={handleNewWindowOpen}
            >
              Export
            </Button>
          ) : null}
        </div>
      </Box>
      <br />
      {loading ? <LinearProgress /> : null}

      {individualAttendanceData.length > 0 ? (
        <>
          <Card variant="soft" color="primary" invertedColors>
            <CardContent orientation="horizontal">
              <CardContent>
                <Typography level="body-md">Total Student</Typography>
                <Typography level="h2">
                  {attendanceHeaderData?.totalStudent}
                </Typography>
              </CardContent>
              <CardContent>
                <Typography level="body-md">Total Present</Typography>
                <Typography level="h2">
                  {attendanceHeaderData?.totalPresent}
                </Typography>
              </CardContent>
              <CardContent>
                <Typography level="body-md">Total Absent</Typography>
                <Typography level="h2">
                  {attendanceHeaderData?.totalAbsent}
                </Typography>
              </CardContent>
              <CardContent>
                <Typography level="body-md">Total On Leave</Typography>
                <Typography level="h2">
                  {attendanceHeaderData?.totalLeave}
                </Typography>
              </CardContent>
              <CardContent>
                <Typography level="body-md">Total On Holiday</Typography>
                <Typography level="h2">
                  {attendanceHeaderData?.totalHoliday}
                </Typography>
              </CardContent>
            </CardContent>
          </Card>
          <br />
          <Table
            aria-label="table variants"
            variant="plain"
            color="neutral"
            stripe={"odd"}
          >
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>FATHER</th>
                <th>CONTACT</th>
                <th>STATUS</th>
                <th style={{ textAlign: "center", width: "190px" }}>COMMENT</th>
                <th style={{ textAlign: "end", width: "190px" }}>TIMESTAMP</th>
              </tr>
            </thead>
            <tbody>
              {individualAttendanceData &&
                individualAttendanceData.map((student, i) => {
                  return (
                    <tr key={student.studentRegId}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Avatar src={student.studentProfile} />
                          {student.studentName}
                        </div>
                      </td>
                      <td>{student.studentFatherName}</td>
                      <td>{student.studentContact}</td>
                      <td>
                        {getAttendanceStatusByCode(student.attendanceStatus)}
                      </td>
                      <td style={{ textAlign: "center", width: "190px" }}>
                        {student.comment !== "" ? student.comment : "_"}
                      </td>
                      <td style={{ textAlign: "end", width: "190px" }}>
                        {"" + student.createdAt}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </Table>
        </>
      ) : null}
    </Paper>
  );
}

export default AttendanceByClass;
