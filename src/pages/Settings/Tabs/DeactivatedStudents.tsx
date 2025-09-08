import MaterialTable from "@material-table/core"
import { Avatar, Card, IconButton, LinearProgress, Stack } from "@mui/joy"
import { Chip, Tooltip } from "@mui/material";
import { useFirebase } from "context/firebaseContext";
import { collection, doc, getDocs, orderBy, query, setDoc, } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StudentDetailsType } from "types/student";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { enqueueSnackbar } from "notistack";
import { CurrencyRupee} from "@mui/icons-material";
const classLookup = {
    1: "Nursery",
    2: "LKG",
    3: "UKG",
    4: "STD-1",
    5: "STD-2",
    6: "STD-3",
    7: "STD-4",
    8: "STD-5",
    9: "STD-6",
    10: "STD-7",
    11: "STD-8",
    12: "STD-9",
    13: "STD-10",
    14: "Pre-Nursery",
};


function DeactivatedStudents() {

    const [loading, setLoading] = useState(false)

    const [students, setStudents] = useState<StudentDetailsType[]>([])
    const [_selectedData, setSelectedData] = useState<StudentDetailsType[]>([])

    const { db } = useFirebase()

    const navigate = useNavigate();



    //fetch deactivated students
    const fetchDeactivatedStudents = async () => {
        try {
            // Create a reference to the STUDENTS collection
            const studentsRef = collection(db, "STUDENTS");

            // Create a query with orderBy and filter where is_active is true
            const q = query(studentsRef, orderBy("created_at", "desc"));

            // Fetch the documents based on the query
            const snap = await getDocs(q);

            // Map over the snapshot to return the student data
            const students = snap.docs
                .map((doc) => ({ ...doc.data() }))
                .filter((student) => student.is_active === false || student.is_active === undefined);

            setStudents(students as StudentDetailsType[]);
            console.log(students)
        } catch (error) {
            console.error("Error fetching deactivated students:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true)
        fetchDeactivatedStudents()
    }
        , [])

    const activateStudent = async (id: string) => {
        try {
            // Create a reference to the document
            const studentRef = doc(db, "STUDENTS", id);
            // Update the is_active field to true
            await setDoc(studentRef, { is_active: true }, { merge: true });
            // Refresh the list of students after activation
            // fetchDeactivatedStudents();
        } catch (error) {
            console.error("Error activating student: ", error);
        }
    };


    const handleActivateSelected = async () => {
        console.log("Selected students for activation: ", _selectedData);
        try {
            const activationPromises = _selectedData.map((student) =>
                activateStudent(student.id)
            );
            await Promise.all(activationPromises);
            console.log("Selected students activated successfully.");
            enqueueSnackbar("Selected students activated successfully.", {
                variant: "success"
            })
            setSelectedData([]); // Clear selection after activation
        } catch (error) {
            console.error("Error activating selected students: ", error);
        }
    };

    //column for material table
    const columnMat = [
        {
            field: "student_id",
            title: "ID",
            render: (rowData: StudentDetailsType) => {
                return (
                    <Link
                        to={`/students/profile/${rowData.id}`}
                        style={{
                            fontSize: "14px",
                            textDecoration: "none",
                            fontWeight: "500",
                            color: "var(--bs-primary-text)",
                        }}
                    >
                        {rowData.admission_no}
                    </Link>
                );
            },
        },
        {
            title: "Profile",
            field: "profil_url",

            export: false,
            render: (rowData: StudentDetailsType) => {

                return <Avatar src={rowData.profil_url} alt="profile-student" />;
            },
        },

        { field: "student_name", title: "Name" },
        {
            field: "class",
            title: "Class",
            lookup: classLookup,
            render: (rowData: StudentDetailsType) => {
                const className = classLookup[rowData.class as keyof typeof classLookup] || "Class unknown";
                return <p>{className}</p>;
            },
        },
        { field: "section", title: "Section" },
        { field: "class_roll", title: "Roll" },
        { field: "father_name", title: "Father Name" },
        { field: "contact_number", title: " Contact number" },
        {
            field: "is_active", title: "Status", render: (rowData: StudentDetailsType) => {
                if (rowData.is_active) {
                    return <Chip label="Active" color="success" variant="outlined" />;
                }
                return <Chip label="Inactive" color="error" variant="outlined" />;
            },
        },

        {
            field: "action", title: "Actions", render: (rowData: StudentDetailsType) => {
                return (
                    <Stack>
                        <Tooltip title="View fee details">
                            <IconButton variant="outlined" onClick={() => {
                                if (rowData) {
                                    const studentDataArr:StudentDetailsType[] =[]
                                    studentDataArr.push(rowData) 
                                    navigate(`/FeeManagement/FeeDetails/${rowData.id}`, { state: studentDataArr });

                                } else {
                                    enqueueSnackbar("Error : Please enter student id or admission number !", {
                                        variant: "error",
                                    });
                                }
                            }}>
                                <CurrencyRupee />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )
            }
        },

    ];
    return (
        <Card variant="outlined">
            {loading && <LinearProgress />}
            <MaterialTable
                style={{ display: "grid", boxShadow: "none" }}
                columns={columnMat}
                data={students}
                title="Students List"
                onSelectionChange={(data) => setSelectedData(data)}
                actions={[
                    {
                        tooltip: "Activate Selected Students",
                        icon: () => <AutoFixHighIcon />,
                        onClick: handleActivateSelected,
                        hidden: _selectedData.length === 0, // Hide if no selection
                    },
                ]}
                options={{
                    selection: true,
                    grouping: false,
                    headerStyle: {
                        backgroundColor: "#F4F4F4",
                    },
                    actionsColumnIndex: -1, // Move the action button to the end
                }}
            />
        </Card>
    )
}

export default DeactivatedStudents