import MaterialTable from "@material-table/core"
import { Paper } from "@mui/material"
import { enqueueSnackbar } from "notistack";
import { StudentDetailsType } from "types/student";
import { doc, writeBatch } from "firebase/firestore";
import { Button, Chip, LinearProgress, Stack } from "@mui/joy";
import { Save } from "@mui/icons-material";
import { useFirebase } from "context/firebaseContext";
import { useEffect, useState } from "react";
import { ROLL_TABLE_COLS_SORT_EXAM } from "./RollTableColumn";

type StudentWithResult = StudentDetailsType & {
  latestResultMark: number;
  newClassRoll: number
};

type SortStudentByAlphaProps = {
  students: StudentWithResult[];
  fetchStudents: () => void;
};
const SortStudentByExam: React.FC<SortStudentByAlphaProps> = ({ students, fetchStudents }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const { db } = useFirebase();

  const handleUpdateRoll = async () => {
    try {
      if (!students || students.length === 0) {
        enqueueSnackbar("No students available to update.", { variant: "warning" });
        return;
      }
      setLoading(true);

      const batch = writeBatch(db);

      students.forEach((student) => {
        const studentRef = doc(db, "STUDENTS", student.id); // Assuming student.id is the doc ID
        batch.update(studentRef, { class_roll: student.newClassRoll });
      });

      await batch.commit();
      setLoading(false);
      enqueueSnackbar("Class roll updated successfully!", { variant: "success" });
      fetchStudents()
    } catch (error) {
      setLoading(false);
      console.error("Error updating class roll:", error);
      enqueueSnackbar("Failed to update class roll.", { variant: "error" });
    }
  };


  const sortStudentByMarks = (students: StudentWithResult[]) => {
    return students.sort((a, b) => b.latestResultMark - a.latestResultMark)
  }

  useEffect(() => {
    const sortedList = sortStudentByMarks(students);
    sortedList.forEach((student, index) => {
      student.newClassRoll = index + 1;
    });
    students = sortedList;
  }, [students])

  return (
    <>
      {
        students.length > 0 &&
        <Stack justifyContent={"space-between"} alignItems={"center"} sx={{ mb: 2 }} direction="row" spacing={2}>
          <Chip color="primary" variant="soft" sx={{ fontSize: "18px", mb: 2 }} >Total Students: {students.length}</Chip>
          <Button startDecorator={<Save />} color="success" onClick={handleUpdateRoll}>Update Roll Number</Button>
        </Stack>
      }
      {loading && <LinearProgress />}
      <Paper>
        <MaterialTable
          style={{ display: "grid", boxShadow: "none" }}
          columns={ROLL_TABLE_COLS_SORT_EXAM}
          data={students}
          options={{
            search: false,
            showTitle: false,
            toolbar: false,
            pageSizeOptions: [5, 10, 20, 50, 100],
            pageSize: 10,
            // grouping: true,
            headerStyle: {
              backgroundColor: "#F4F4F4",
              // color: "#FFF",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              margin: 1
            },
            actionsColumnIndex: -1,
            rowStyle: (rowData, index) => ({
              backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
            }),
          }}
        />
      </Paper>
    </>
  )
}

export default SortStudentByExam