import {
  Avatar,
  Box,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  LinearProgress,
  Option,
  Select,
  Typography,
  Skeleton
} from "@mui/joy";
import { useEffect, useState } from "react";
import {
  getClassNameByValue,
  getCurrentDate,
} from "utilities/UtilitiesFunctions";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { AttendanceRowType, ClassAttendanceSummary } from "types/AttendanceType";
import {
  getClassAttendanceForDate,
  getClassAttendanceSummary,
} from "services/firestore.attendance";
import MaterialTable from "@material-table/core";
import { Chip } from "@mui/material";
import { ExportCsv, ExportPdf } from "@material-table/exporters";

function AttendanceByClass() {
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [selectedClass, setSelectedClass] = useState<number | null>(null);

  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  const [attendanceDataSummary, setAttendanceDataSummary] =
    useState<ClassAttendanceSummary | null>(null);
  const [attendanceForClass, setAttendanceForClass] =
    useState<AttendanceRowType[]>([]);

  useEffect(() => {
    async function initAttendance() {
      if (selectedClass === null) return;

      // -------------------
      // LOAD SUMMARY FIRST
      // -------------------
      setSummaryLoading(true);
      setAttendanceDataSummary(null);

      const summary = await getClassAttendanceSummary(
        selectedDate,
        selectedClass
      );
      setAttendanceDataSummary(summary);
      setSummaryLoading(false);

      // -------------------
      // LOAD TABLE AFTER SUMMARY
      // -------------------
      setTableLoading(true);
      setAttendanceForClass([]);

      const attendance = await getClassAttendanceForDate(
        selectedClass,
        selectedDate
      );
      setAttendanceForClass(attendance);
      setTableLoading(false);
    }

    initAttendance();
  }, [selectedDate, selectedClass]);

  const attendanceColumns = [
    {
      field: "profilePicUrl",
      title: "Profile",
      render: (rowData: AttendanceRowType) => (
        <Avatar src={rowData.profilePicUrl}>
          {rowData.name.charAt(0)}
        </Avatar>
      ),
      width: 80,
      export: false,
    },
    {
      field: "admissionNo",
      title: "ID",
      width: 150,
    },
    {
      field: "name",
      title: "Student Name",
      width: 200,
    },
    {
      field: "rollNo",
      title: "Roll No",
      width: 110,
    },
    {
      field: "mobileNo",
      title: "Mobile No",
      width: 150,
    },
    {
      field: "fatherName",
      title: "Father Name",
      width: 200,
    },
    {
      field: "status",
      title: "Status",
      width: 140,
      render: (row: AttendanceRowType) => (
        <Chip
          label={row.status}
          color={row.status === "PRESENT" ? "success" : "error"}
          variant="outlined"
        />
      ),
    },
  ];

  return (
    <Box
      sx={{
        border: "1px solid oklch(.900 .013 255.508)",
        borderRadius: "10px",
        padding: 4,
      }}
    >
      {/* ---------------- FILTER ---------------- */}
      <Box
        component="form"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Typography level="body-md">
          Filter Attendance (Please select date and class)
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <FormControl>
            <FormLabel>Select Date</FormLabel>
            <Input
              required
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
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
              sx={{ minWidth: 200 }}
            >
              {SCHOOL_CLASSES.map((item) => (
                <Option key={item.id} value={item.value}>
                  {item.title}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <br />

      {/* ---------------- SUMMARY LOADER ---------------- */}
      {summaryLoading && (
        <Card variant="soft" color="neutral">
          <CardContent>
            <Skeleton height={30} width={200} />
            <Skeleton height={30} width={200} />
            <Skeleton height={30} width={200} />
          </CardContent>
        </Card>
      )}

      {/* ---------------- SUMMARY SECTION ---------------- */}
      {!summaryLoading && attendanceDataSummary && (
        <>
          <Card variant="soft" color="primary" invertedColors>
            <CardContent orientation="horizontal">
              <CardContent>
                <Typography level="body-md">Total Student</Typography>
                <Typography level="h2">{attendanceDataSummary.total}</Typography>
              </CardContent>

              <CardContent>
                <Typography level="body-md">Total Present</Typography>
                <Typography level="h2">{attendanceDataSummary.present}</Typography>
              </CardContent>

              <CardContent>
                <Typography level="body-md">Total Absent</Typography>
                <Typography level="h2">{attendanceDataSummary.absent}</Typography>
              </CardContent>

              <CardContent>
                <Typography level="body-md">Total On Leave</Typography>
                <Typography level="h2">{attendanceDataSummary.leave}</Typography>
              </CardContent>

              <CardContent>
                <Typography level="body-md">Total On Holiday</Typography>
                <Typography level="h2">{attendanceDataSummary.holiday}</Typography>
              </CardContent>
            </CardContent>
          </Card>

          <br />

          {/* ---------------- TABLE ---------------- */}
          <Box
            sx={{
              border: "1px solid oklch(.900 .013 255.508)",
              borderRadius: "10px",
              padding: "2px",
            }}
          >
            {tableLoading && <LinearProgress />}

            <MaterialTable
              style={{
                display: tableLoading ? "none" : "grid",
                boxShadow: "none",
                fontSize: "0.92rem",
              }}
              columns={attendanceColumns}
              data={attendanceForClass}
              title="Attendance Details"
              options={{
                grouping: true,
                pageSizeOptions: [5, 10, 20, 50, 100],
                pageSize: 10,
                headerStyle: {
                  backgroundColor: "#5d87ff",
                  color: "#FFF",
                },
                rowStyle: {
                  fontSize: "0.92rem",
                  height: 34,
                },
                exportMenu: [
                  {
                    label: "Export PDF",
                    exportFunc: (cols, data) =>
                      ExportPdf(
                        cols,
                        data,
                        `Attendance-${getClassNameByValue(selectedClass!)}-${selectedDate}`
                      ),
                  },
                  {
                    label: "Export CSV",
                    exportFunc: (cols, data) =>
                      ExportCsv(
                        cols,
                        data,
                        `Attendance-${getClassNameByValue(selectedClass!)}-${selectedDate}`
                      ),
                  },
                ],
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
}

export default AttendanceByClass;
