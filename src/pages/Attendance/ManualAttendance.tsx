// pages/ManualAttendance.tsx

import { Divider, LinearProgress } from "@mui/material";
import {
  Avatar,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Table,
} from "@mui/joy";

import { Refresh, Save, Search } from "@mui/icons-material";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { useState } from "react";
import { getClassNameByValue, getCurrentDate } from "utilities/UtilitiesFunctions";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getStudentsWithAttendance } from "services/attendance/firestore.attendance";

import { enqueueSnackbar } from "notistack";
import { AttendanceStatus, StudentAttendance } from "types/AttendanceType";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const statusMapping: Record<string, AttendanceStatus> = {
  P: "PRESENT",
  A: "ABSENT",
  H: "HOLIDAY",
  L: "LEAVE",
  S: "HALF_DAY",
};

function ManualAttendance() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getCurrentDate());
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [students, setStudents] = useState<StudentAttendance[]>([]);

  const { db } = useFirebase()

  // -------------------------------
  // LOAD STUDENTS + ATTENDANCE
  // -------------------------------
  const fetchStudent = async () => {

    if (!selectedClass) {
      enqueueSnackbar("Select a class", { variant: "error" });
      return;
    }

    setLoading(true);

    const data = await getStudentsWithAttendance(selectedClass, selectedDate);
    setStudents(data);

    setLoading(false);
  };

  // Search filter
  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------------
  // UPDATE INDIVIDUAL STUDENT
  // -------------------------------
  const handleRadioSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    student: StudentAttendance
  ) => {
    const newValue = e.target.value;

    const updated = students.map((item) => {
      if (item.studentId !== student.studentId) return item;

      const hasChanged = item.originalStatus !== newValue;

      return {
        ...item,
        selected_option: newValue,
        hasChanged: hasChanged,
      };
    });

    setStudents(updated);
  };
  // -------------------------------
  // MARK ALL
  // -------------------------------
  const handleMarkAll = (val: string | null) => {
    if (!val || val === "none") return;

    const updated = students.map((stu) => ({
      ...stu,
      selected_option: val,
    }));

    setStudents(updated);
  };

  // -------------------------------
  // SAVE (EVENT-DRIVEN)
  // -------------------------------
  const handleSave = async () => {
    if (!selectedClass) {
      enqueueSnackbar("Select a class first!", { variant: "error" });
      return;
    }
    if (students.length === 0) {
      enqueueSnackbar("No students loaded!", { variant: "warning" });
      return;
    }

    try {
      setLoading(true);
      const eventsRef = collection(db, "ATTENDANCE_EVENTS");

      const changedStudents = students.filter((stu) => stu.hasChanged);
      if (changedStudents.length === 0) {
        enqueueSnackbar("No changes to save.", { variant: "info" });
        return;
      }

      const promises = students.map((stu) =>
        addDoc(eventsRef, {
          studentId: stu.studentId,
          classId: selectedClass,
          date: selectedDate,
          status: statusMapping[stu.selected_option || "P"],
          timestamp: serverTimestamp(),
          source: "MANUAL",
        })
      );

      await Promise.all(promises);
      
      enqueueSnackbar("Attendance saved!", { variant: "success" });

      await fetchStudent(); // Reload

    } catch (err) {
      console.error(err);
      enqueueSnackbar("Error saving attendance", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeaderWithHelpButton title="Mark Attendance Manually" />
      <br />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 300px" },
          gap: 3,
        }}
      >
        {/* LEFT PANEL */}
        <Box>
          {loading && <LinearProgress />}

          {students.length > 0 && (
            <>
              <Divider />
              <br />

              {/* SEARCH + MARK ALL + SAVE */}
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Input
                  startDecorator={<Search />}
                  placeholder="Search student"
                  sx={{ flex: 0.6 }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Select
                    defaultValue="P"
                    sx={{ minWidth: "200px" }}
                    onChange={(e, val) => handleMarkAll(val)}
                  >
                    <Option value="none">None</Option>
                    <Option value="P">Present</Option>
                    <Option value="A">Absent</Option>
                    <Option value="H">Holiday</Option>
                    <Option value="L">Leave</Option>
                    <Option value="S">Half Day</Option>
                  </Select>

                  <Button startDecorator={<Save />} onClick={handleSave}>
                    Save
                  </Button>
                </Box>
              </Box>

              {/* TABLE */}
              <Table variant="plain">
                <thead>
                  <tr>
                    <th style={{ width: "150px" }}>ID</th>
                    <th>Student</th>
                    <th>Class Id</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((stu) => (
                    <tr key={stu.studentId}>
                      <td>{stu.admissionNo}</td>

                      <td>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar src={stu.profilePicUrl || ""} />
                          {stu.name}
                        </Box>
                      </td>
                      <td>{getClassNameByValue(stu.classId)}</td>

                      <td>
                        <RadioGroup
                          value={stu.selected_option}
                          onChange={(e) => handleRadioSelect(e, stu)}
                          orientation="horizontal"
                          sx={{ gap: 1 }}
                        >
                          {["P", "A", "H", "L", "S"].map((val) => (
                            <Sheet
                              key={val}
                              sx={{ p: 1, borderRadius: "md", boxShadow: "sm" }}
                            >
                              <Radio label={val} overlay disableIcon value={val} />
                            </Sheet>
                          ))}
                        </RadioGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Box>

        {/* RIGHT PANEL (CLASS + DATE) */}
        <Box
          sx={{
            border: "1px solid #ddd",
            p: 2,
            borderRadius: "12px",
            height: "100vh",
            position: "sticky",
            top: 80,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* CLASS */}
          <FormControl>
            <FormLabel>Select Class</FormLabel>
            <Select
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
            >
              {SCHOOL_CLASSES.map((c) => (
                <Option value={c.value} key={c.value}>
                  {c.title}
                </Option>
              ))}
            </Select>
          </FormControl>

          {/* DATE PICKER */}
          <FormControl>
            <FormLabel>Select Date</FormLabel>
            <Calendar
              onChange={(date: any) => {
                const yyyy = date.getFullYear();
                const mm = String(date.getMonth() + 1).padStart(2, "0");
                const dd = String(date.getDate()).padStart(2, "0");
                setSelectedDate(`${yyyy}-${mm}-${dd}`);
              }}
              value={new Date(selectedDate)}
            />
          </FormControl>

          <Button startDecorator={<Refresh />} onClick={fetchStudent}>
            Load Students
          </Button>
        </Box>
      </Box>
    </>
  );
}

export default ManualAttendance;
