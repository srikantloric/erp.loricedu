import {
    Divider,
    FormControl,
    FormLabel,
    Input,
    LinearProgress,
    Option,
    Select,
    Stack,
    Table,
} from "@mui/joy";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useFirebase } from "context/firebaseContext";
import { StudentDetailsType } from "types/student";
import RFIDStudentRow from "./RFIDStudentRow";
import { Paper } from "@mui/material";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { Search } from "@mui/icons-material";

export default function RFIDConfigTab() {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<StudentDetailsType[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const { db } = useFirebase();

    const fetchStudents = async () => {
        if (!selectedClass) return;

        try {
            setLoading(true);
            const studentsQuery = query(
                collection(db, "STUDENTS"),
                where("class", "==", selectedClass)
            );
            const querySnapshot = await getDocs(studentsQuery);
            const studentsData = querySnapshot.docs.map(doc => ({
                ...doc.data(),
            }));
            setStudents(studentsData as StudentDetailsType[]);
        } catch (error) {
            console.error("Error fetching students: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [selectedClass]);

    const updateStudentRfid = (id: string, newCode: string) => {
        setStudents(prev =>
            prev.map(std =>
                std.id === id ? { ...std, rfidCode: newCode } : std
            )
        );
    };

    const filteredStudents = students.filter((student) => {
        const query = searchQuery.toLowerCase();
        return (
            student.id.toLowerCase().includes(query) ||
            student.student_name.toLowerCase().includes(query) ||
            student.father_name.toLowerCase().includes(query) ||
            student.admission_no.toLowerCase().includes(query)
        );
    });

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <FormControl>
                    <FormLabel>Class</FormLabel>
                    <Select
                        sx={{ minWidth: 200 }}
                        onChange={(e, newVal) => setSelectedClass(newVal)}
                        value={selectedClass || ""}
                        placeholder="Select class"
                    >
                        {SCHOOL_CLASSES.map(item => (
                            <Option key={item.value} value={item.value}>
                                {item.title}
                            </Option>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {loading && <LinearProgress />}

            {students.length > 0 && (
                <>
                    <Divider />
                    <br />
                    <div
                        style={{ display: "flex", justifyContent: "space-between" }}
                    >
                        <Input
                            startDecorator={<Search />}
                            sx={{ flex: 0.6 }}
                            placeholder="Search by student id, admission no, or father's name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                     
                    </div>
                    <br />
                    <Table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Students</th>
                                <th>Father Name</th>
                                <th>Roll No.</th>
                                <th>RFID Code</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(student => (
                                <RFIDStudentRow
                                    key={student.student_id}
                                    student={student}
                                    onUpdate={updateStudentRfid}
                                />
                            ))}
                        </tbody>
                    </Table>
                </>
            )}
        </Paper>
    );
}
