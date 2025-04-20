// components/RFIDStudentRow.tsx
import { Edit, Save } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  Input,
  Stack,
} from "@mui/joy";
import { doc, updateDoc } from "firebase/firestore";
import {  useState } from "react";
import { StudentDetailsType } from "types/student";
import { useFirebase } from "context/firebaseContext";
import { enqueueSnackbar } from "notistack";

interface RFIDStudentRowProps {
  student: StudentDetailsType;
  onUpdate: (id: string, rfidCode: string) => void;
}

export default function RFIDStudentRow({ student, onUpdate }: RFIDStudentRowProps) {
  const { db } = useFirebase();

  const isInitiallyEmpty = !student.rfidCode;

  const [editing, setEditing] = useState(isInitiallyEmpty);
  const [rfidInput, setRfidInput] = useState(student.rfidCode || "");

  const handleSave = async () => {
    if (!rfidInput.trim()) return;
    try {
      const studentRef = doc(db, "STUDENTS", student.id);
      await updateDoc(studentRef, { rfidCode: rfidInput.trim() });
      onUpdate(student.id, rfidInput.trim());
      enqueueSnackbar("RFID Code updated successfully!", { variant: "success" });
      setEditing(false);
    } catch (error) {
      console.error("Error saving RFID:", error);
      enqueueSnackbar("Failed to update!", { variant: "error" });
    }
  };

  return (
    <tr>
      <td>{student.admission_no}</td>
      <td>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar />
          {student.student_name}
        </Stack>
      </td>
      <td>{student.father_name}</td>
      <td>{student.class_roll}</td>
      <td>
        <Stack direction="row" spacing={1}>
          <Input
            value={rfidInput}
            onChange={(e) => setRfidInput(e.target.value)}
            disabled={!editing}
            placeholder="Enter RFID"
          />
          {editing ? (
            <IconButton onClick={handleSave}>
              <Save color="success" />
            </IconButton>
          ) : (
            <IconButton onClick={() => setEditing(true)}>
              <Edit color="primary" />
            </IconButton>
          )}
        </Stack>
      </td>
    </tr>
  );
}
