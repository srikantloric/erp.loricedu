import MaterialTable from "@material-table/core"
import { Save } from "@mui/icons-material"
import { Button, Chip, FormControl, FormLabel, Option, Radio, RadioGroup, Select, Stack } from "@mui/joy"
import { Paper } from "@mui/material"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { SCHOOL_CLASSES } from "config/schoolConfig"
import { useFirebase } from "context/firebaseContext"
import { collection, doc, getDocs, query, where, writeBatch } from "firebase/firestore"
import { enqueueSnackbar } from "notistack"
import { useEffect, useState } from "react"
import { resultType } from "types/results"
import { StudentDetailsType } from "types/student"
import { getClassNameByValue } from "utilities/UtilitiesFunctions"


type StudentWithResult = StudentDetailsType & {
    latestResultMark: number;
    newClassRoll: number
};


function RollNoUpdator() {
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<StudentWithResult[]>([]);
    const [value, setValue] = useState('marks');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };
    const { db } = useFirebase();

    const fetchStudents = async () => {
        setStudents([])
        // Fetch students for selected class
        const studentsQuery = query(collection(db, "STUDENTS"), where("class", "==", selectedClass));
        const studentsSnap = await getDocs(studentsQuery);

        if (studentsSnap.empty) {
            setLoading(false);
            enqueueSnackbar("No result found :)", { variant: "warning" });
            return;
        }

        // Step 2: Map and fetch latest result from nested collection
        const studentList: StudentWithResult[] = await Promise.all(
            studentsSnap.docs.map(async (doc) => {
                const studentData = doc.data() as StudentWithResult;
                const studentId = doc.id;

                // Step 2: Query student's PUBLISHED_RESULT subcollection for examId
                const examResultQuery = query(
                    collection(db, "STUDENTS", studentId, "PUBLISHED_RESULTS"),
                    where("examId", "==", "APXAM202501"),
                );
                const resultSnap = await getDocs(examResultQuery);
                console.log(resultSnap)
                if (!resultSnap.empty) {
                    const latestResult = resultSnap.docs[0].data() as resultType;
                    let marksObtained = latestResult.result.reduce((total, item) => {
                        const obtainedMarkCalculated =
                            item.paperId === "DRAWING"
                                ? 0
                                : Number(item.paperMarkTheory) +
                                Number(item.paperMarkPractical);

                        return total + obtainedMarkCalculated;
                    }, 0);
                    console.log(latestResult)
                    studentData.latestResultMark = marksObtained; // You can type this if needed
                } else {
                    studentData.latestResultMark = 0; // You can type this if needed
                }
                return studentData;
            })
        );

        studentList.forEach((student, index) => {
            student.newClassRoll = index + 1;
        });
        setStudents(studentList)
    }
    const sortStudentsByName = (students: StudentWithResult[]) => {
        return [...students].sort((a, b) => {
            const nameA = a.student_name?.toLowerCase() || "";
            const nameB = b.student_name?.toLowerCase() || "";
            return nameA.localeCompare(nameB);
        });
    };

    const sortStudentByMarks = (students: StudentWithResult[]) => {
        return students.sort((a, b) => b.latestResultMark - a.latestResultMark)
    }

    useEffect(() => {
        setStudents([])
        if (value === "marks") {
            const sortedList = sortStudentByMarks(students);
            sortedList.forEach((student, index) => {
                student.newClassRoll = index + 1;
            });
            setStudents(sortedList)
        } else {
            const sortedList = sortStudentsByName(students);
            sortedList.forEach((student, index) => {
                student.newClassRoll = index + 1;
            });
            setStudents(sortedList)
        }
    }, [value])



    const columnMat = [

        { title: "Student Id", field: "admission_no" },
        { title: "Student Name", field: "student_name" },
        {
            title: "Class", field: "class", render: (row: StudentDetailsType) => {
                return getClassNameByValue(row.class!)
            }
        },

        {
            title: "Marks Obtained Last Exam", field: "latestResultMark",
        },
        {
            title: "Current Roll", field: "class_roll", render: (row: StudentWithResult) => {
                return (
                    <Chip color="primary" variant="plain" sx={{ fontSize: "18px" }}>{row.class_roll}</Chip>
                )
            }
        },
        {
            title: "New Roll", field: "newClassRoll", render: (row: StudentWithResult) => {
                return (
                    <Chip color="success" variant="solid" sx={{ fontSize: "18px" }}>{row.newClassRoll}</Chip>
                )
            }
        },
    ]

    const handleUpdateRoll = async () => {
        try {
            if (!students || students.length === 0) {
                enqueueSnackbar("No students available to update.", { variant: "warning" });
                return;
            }

            const batch = writeBatch(db);

            students.forEach((student) => {
                const studentRef = doc(db, "STUDENTS", student.id); // Assuming student.id is the doc ID
                batch.update(studentRef, { class_roll: student.newClassRoll });
            });

            await batch.commit();
            enqueueSnackbar("Class roll updated successfully!", { variant: "success" });
            fetchStudents()
        } catch (error) {
            console.error("Error updating class roll:", error);
            enqueueSnackbar("Failed to update class roll.", { variant: "error" });
        }
    };


    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Student Roll Number Updation" />
                <Stack justifyContent={"flex-end"} direction={"row"} mt={2} mb={1}>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                        <Select
                            placeholder="choose class"
                            onChange={(e, val) => setSelectedClass(val)}
                        >
                            {SCHOOL_CLASSES.map((item) => {
                                return <Option value={item.value}>{item.title}</Option>;
                            })}
                        </Select>
                        <Button
                            sx={{ ml: "8px" }}
                            onClick={fetchStudents}
                            loading={loading}
                        >Fetch Students</Button>
                        <Button startDecorator={<Save />} color="success" onClick={handleUpdateRoll}>Update Roll Number</Button>
                    </Stack>
                </Stack>
                <Stack direction={"row"}>

                    <FormControl>
                        <FormLabel>Sort by</FormLabel>
                        <RadioGroup
                            defaultValue="female"
                            name="controlled-radio-buttons-group"
                            value={value}
                            onChange={handleChange}

                            sx={{ my: 1, }}
                        >
                            <Radio value="marks" label="Exam Mark" />
                            <Radio value="alpha" label="Alphabetically" />

                        </RadioGroup>
                    </FormControl>




                </Stack>
                <Paper>

                    <MaterialTable
                        style={{ display: "grid", boxShadow: "none" }}
                        columns={columnMat}
                        data={students}
                        options={{
                            search: false,
                            showTitle: false,
                            toolbar: false,
                            pageSizeOptions: [5, 10, 20, 50, 100],
                            pageSize: 20,
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
            </LSPage>
        </PageContainer >
    )
}

export default RollNoUpdator